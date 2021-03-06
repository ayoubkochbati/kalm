import { Box, Button, Fade, Grid, Paper, Popper } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Immutable from "immutable";
import { POPPER_ZINDEX } from "layout/Constants";
import PopupState, { anchorRef, bindPopper, InjectedProps } from "material-ui-popup-state";
import React from "react";
import { connect, DispatchProp } from "react-redux";
import { arrayPush, WrappedFieldArrayProps } from "redux-form";
import { Field, FieldArray } from "redux-form/immutable";
import {
  ComponentLikePort,
  PortProtocolGRPC,
  PortProtocolHTTP,
  PortProtocolHTTP2,
  PortProtocolTCP,
  PortProtocolUDP,
} from "types/componentTemplate";
import { AddIcon, DeleteIcon } from "widgets/Icon";
import { IconButtonWithTooltip } from "widgets/IconButtonWithTooltip";
import { PortChart } from "widgets/PortChart";
import { RenderSelectField } from "../Basic/select";
import { KRenderDebounceTextField } from "../Basic/textfield";
import { NormalizePort } from "../normalizer";
import { ValidatorRequired, ValidatorContainerPortRequired, ValidatorPort } from "../validator";

interface FieldArrayComponentHackType {
  name: any;
  component: any;
  validate: any;
}

interface FieldArrayProps extends DispatchProp {}

interface Props extends WrappedFieldArrayProps<ComponentLikePort>, FieldArrayComponentHackType, FieldArrayProps {}

const ValidatorPorts = (values: Immutable.List<ComponentLikePort>, _allValues?: any, _props?: any, _name?: any) => {
  if (!values) return undefined;
  const protocolServicePorts = new Set<string>();

  for (let i = 0; i < values.size; i++) {
    const port = values.get(i)!;
    const servicePort = port.get("servicePort") || port.get("containerPort");

    if (servicePort) {
      const protocol = port.get("protocol");
      const protocolServicePort = protocol + "-" + servicePort;

      if (!protocolServicePorts.has(protocolServicePort)) {
        protocolServicePorts.add(protocolServicePort);
      } else if (protocolServicePort !== "") {
        return "Listening port on a protocol should be unique.  " + protocol + " - " + servicePort;
      }
    }
  }
};

class RenderPorts extends React.PureComponent<Props> {
  public render() {
    const {
      fields,
      dispatch,
      meta: { error, form },
    } = this.props;
    return (
      <>
        <Box mb={2}>
          <Grid item xs>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              size="small"
              onClick={() =>
                dispatch(
                  arrayPush(
                    form,
                    fields.name,
                    Immutable.Map({
                      protocol: PortProtocolHTTP,
                      containerPort: null,
                    }),
                  ),
                )
              }
            >
              Add
            </Button>

            {/* {submitFailed && error && <span>{error}</span>} */}
            {error ? (
              <Box mt={2}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : null}
          </Grid>
        </Box>

        {fields.map((field, index) => {
          return (
            <Grid container spacing={2} key={field}>
              <Grid item xs>
                <Field
                  name={`${field}.protocol`}
                  component={RenderSelectField}
                  required
                  label="Protocol"
                  validate={ValidatorRequired}
                  options={[
                    { value: PortProtocolHTTP, text: PortProtocolHTTP },
                    { value: PortProtocolHTTP2, text: PortProtocolHTTP2 },
                    { value: PortProtocolGRPC, text: PortProtocolGRPC },
                    { value: PortProtocolTCP, text: PortProtocolTCP },
                    { value: PortProtocolUDP, text: PortProtocolUDP },
                  ]}
                />
              </Grid>
              <PopupState variant="popover" popupId={`container-port-${index}`} disableAutoFocus>
                {(popupState: InjectedProps) => {
                  return (
                    <>
                      <Grid
                        item
                        xs
                        ref={(c: any) => {
                          anchorRef(popupState)(c);
                        }}
                      >
                        <Field
                          component={KRenderDebounceTextField}
                          onFocus={popupState.open}
                          onBlur={popupState.close}
                          name={`${field}.containerPort`}
                          label="Container port"
                          placeholder="1~65535,not 443"
                          required
                          validate={ValidatorContainerPortRequired}
                          normalize={NormalizePort}
                        />
                      </Grid>
                      <Popper {...bindPopper(popupState)} transition placement="top" style={{ zIndex: POPPER_ZINDEX }}>
                        {({ TransitionProps }) => (
                          <Fade {...TransitionProps} timeout={350}>
                            <Paper elevation={2}>
                              <Box p={2}>
                                <PortChart highlightContainerPort />
                              </Box>
                            </Paper>
                          </Fade>
                        )}
                      </Popper>
                    </>
                  );
                }}
              </PopupState>
              <PopupState variant="popover" popupId={`service-port-${index}`} disableAutoFocus>
                {(popupState: InjectedProps) => {
                  return (
                    <>
                      <Grid
                        item
                        xs
                        ref={(c: any) => {
                          anchorRef(popupState)(c);
                        }}
                      >
                        <Field
                          component={KRenderDebounceTextField}
                          onFocus={popupState.open}
                          onBlur={popupState.close}
                          name={`${field}.servicePort`}
                          label="Service Port"
                          placeholder="Default to equal publish port"
                          validate={ValidatorPort}
                          normalize={NormalizePort}
                        />
                      </Grid>
                      <Popper {...bindPopper(popupState)} transition placement="top" style={{ zIndex: POPPER_ZINDEX }}>
                        {({ TransitionProps }) => (
                          <Fade {...TransitionProps} timeout={350}>
                            <Paper elevation={2}>
                              <Box p={2}>
                                <PortChart highlightServicePort />
                              </Box>
                            </Paper>
                          </Fade>
                        )}
                      </Popper>
                    </>
                  );
                }}
              </PopupState>

              <Grid item xs={1}>
                <IconButtonWithTooltip
                  tooltipPlacement="top"
                  tooltipTitle="Delete"
                  aria-label="delete"
                  onClick={() => fields.remove(index)}
                >
                  <DeleteIcon />
                </IconButtonWithTooltip>
              </Grid>
            </Grid>
          );
        })}
      </>
    );
  }
}

export const Ports = connect()((props: FieldArrayProps) => {
  return <FieldArray name="ports" component={RenderPorts} validate={ValidatorPorts} {...props} />;
});
