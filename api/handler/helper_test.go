package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	client2 "github.com/kalmhq/kalm/api/client"
	"github.com/kalmhq/kalm/api/config"
	"github.com/kalmhq/kalm/api/server"
	"github.com/kalmhq/kalm/controller/api/v1alpha1"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/suite"
	"io"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/kubernetes/scheme"
	"net/http/httptest"
	"path/filepath"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/envtest"
	"strings"
	"time"
)

type WithControllerTestSuite struct {
	suite.Suite
	testEnv   *envtest.Environment
	Client    client.Client
	apiServer *echo.Echo
	ctx       context.Context
}

type ResponseRecorder struct {
	*httptest.ResponseRecorder
	bytes []byte
}

func (r *ResponseRecorder) read() {
	r.bytes = r.Body.Bytes()
}

func (r *ResponseRecorder) BodyAsString() string {
	return string(r.bytes)
}

func (r *ResponseRecorder) BodyAsJSON(obj interface{}) {
	err := json.Unmarshal(r.bytes, obj)

	if err != nil {
		panic(fmt.Errorf("Unmarshal response body failed, %+v", err))
	}
}

func (suite *WithControllerTestSuite) SetupSuite() {
	suite.Nil(scheme.AddToScheme(scheme.Scheme))
	suite.Nil(v1alpha1.AddToScheme(scheme.Scheme))
	suite.ctx = context.Background()

	suite.testEnv = &envtest.Environment{
		CRDDirectoryPaths: []string{filepath.Join("..", "..", "controller", "config", "crd", "bases")},
	}

	cfg, err := suite.testEnv.Start()

	if err != nil {
		panic(err)
	}

	// TODO the test server has no permissions

	clt, err := client.New(cfg, client.Options{Scheme: scheme.Scheme})

	if err != nil {
		panic(err)
	}

	suite.Client = clt

	runningConfig := &config.Config{
		KubernetesApiServerAddress: cfg.Host,
	}

	e := server.NewEchoInstance()
	clientManager := client2.NewClientManager(runningConfig)
	apiHandler := NewApiHandler(clientManager)
	apiHandler.InstallMainRoutes(e)
	apiHandler.InstallWebhookRoutes(e)

	suite.apiServer = e
}

func (suite *WithControllerTestSuite) Get(namespace, name string, obj runtime.Object) error {
	return suite.Client.Get(suite.ctx, types.NamespacedName{Namespace: namespace, Name: name}, obj)
}

func (suite *WithControllerTestSuite) List(obj runtime.Object, opts ...client.ListOption) error {
	return suite.Client.List(suite.ctx, obj, opts...)
}

func (suite *WithControllerTestSuite) Create(obj runtime.Object, opts ...client.CreateOption) error {
	return suite.Client.Create(suite.ctx, obj, opts...)
}

func (suite *WithControllerTestSuite) Delete(obj runtime.Object, opts ...client.DeleteOption) error {
	return suite.Client.Delete(suite.ctx, obj, opts...)
}

func (suite *WithControllerTestSuite) Update(obj runtime.Object, opts ...client.UpdateOption) error {
	return suite.Client.Update(suite.ctx, obj, opts...)
}

func (suite *WithControllerTestSuite) Patch(obj runtime.Object, patch client.Patch, opts ...client.PatchOption) error {
	return suite.Client.Patch(suite.ctx, obj, patch, opts...)
}

func (suite *WithControllerTestSuite) TearDownSuite() {
	suite.testEnv.Stop()
}

func (suite *WithControllerTestSuite) Eventually(condition func() bool, msgAndArgs ...interface{}) bool {
	waitFor := time.Second * 20
	tick := time.Millisecond * 500
	return suite.Suite.Eventually(condition, waitFor, tick, msgAndArgs...)
}

func (suite *WithControllerTestSuite) NewRequest(method string, path string, body interface{}) *ResponseRecorder {
	return suite.NewRequestWithHeaders(method, path, body, map[string]string{
		echo.HeaderAuthorization: "Bearer faketoken", // TODO use a real token
	})
}

func (suite *WithControllerTestSuite) NewRequestWithHeaders(method string, path string, body interface{}, headers map[string]string) *ResponseRecorder {
	var reader io.Reader

	switch v := body.(type) {
	case nil:
		reader = bytes.NewReader([]byte{})
	case string:
		reader = strings.NewReader(v)
	default:
		reader = toReader(body)
	}

	req := httptest.NewRequest(method, path, reader)

	if headers != nil {
		for k, v := range headers {
			req.Header.Add(k, v)
		}
	}
	req.Header.Add(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := &ResponseRecorder{
		ResponseRecorder: httptest.NewRecorder(),
	}
	suite.apiServer.ServeHTTP(rec, req)
	rec.read()
	return rec
}

func toReader(obj interface{}) io.Reader {
	bts, _ := json.Marshal(obj)
	return bytes.NewBuffer(bts)
}

func (suite *WithControllerTestSuite) getPVCList(ns string) (*v1.PersistentVolumeClaimList, error) {
	var pvcList v1.PersistentVolumeClaimList
	err := suite.List(&pvcList, client.InNamespace(ns))
	return &pvcList, err
}

func (suite *WithControllerTestSuite) getComponentList(ns string) (v1alpha1.ComponentList, error) {
	var compList v1alpha1.ComponentList
	err := suite.List(&compList, client.InNamespace(ns))
	return compList, err
}

func (suite *WithControllerTestSuite) getComponent(ns, compName string) (v1alpha1.Component, error) {
	var comp v1alpha1.Component
	err := suite.Get(ns, compName, &comp)
	return comp, err
}

func (suite *WithControllerTestSuite) ensureNamespaceExist(ns string) {
	nsKey := metaV1.ObjectMeta{Name: ns}

	var namespace v1.Namespace
	err := suite.Get("", ns, &namespace)

	if err != nil {
		if errors.IsNotFound(err) {
			err = suite.Create(&v1.Namespace{ObjectMeta: nsKey})
			suite.Nil(err)
		} else {
			panic(err)
		}
	}

	suite.Eventually(func() bool {
		err := suite.Get("", ns, &namespace)
		return err == nil
	})
}

func (suite *WithControllerTestSuite) ensureNamespaceDeleted(ns string) {
	suite.ensureObjectDeleted(&v1.Namespace{ObjectMeta: metaV1.ObjectMeta{Name: ns}})
}

func (suite *WithControllerTestSuite) ensureObjectDeleted(obj runtime.Object) {
	_ = suite.Delete(obj)

	suite.Eventually(func() bool {
		key, err := client.ObjectKeyFromObject(obj)
		if err != nil {
			return false
		}
		err = suite.Get(key.Namespace, key.Name, obj)
		return errors.IsNotFound(err)
	})
}
