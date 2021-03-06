import { Grid } from "@material-ui/core";
import Warning from "@material-ui/icons/Warning";
import { Alert, AlertTitle } from "@material-ui/lab";
import { KAutoCompleteOption, KAutoCompleteSingleValue } from "forms/Basic/autoComplete";
import { KRenderSlider } from "forms/Basic/slider";
import React from "react";
import { WrappedFieldArrayProps } from "redux-form";
import { Field } from "redux-form/immutable";
import { DeleteIcon } from "widgets/Icon";
import { IconButtonWithTooltip } from "widgets/IconButtonWithTooltip";
import { HttpRouteDestination } from "types/route";
import { ValidatorRequired } from "../validator";
import { RootState } from "reducers";
import { connect } from "react-redux";
import Typography from "@material-ui/core/Typography";
import {
  PortProtocolGRPC,
  PortProtocolGRPCWEB,
  PortProtocolHTTP,
  PortProtocolHTTP2,
  PortProtocolHTTPS,
} from "types/componentTemplate";

interface FieldArrayComponentHackType {
  name: any;
  component: any;
  rerenderOnEveryChange: any;
  validate: any;
}

const mapStateToProps = (state: RootState) => {
  return {
    activeNamespace: state.get("namespaces").get("active"),
    services: state.get("services").get("services"),
  };
};

interface Props
  extends WrappedFieldArrayProps<HttpRouteDestination>,
    FieldArrayComponentHackType,
    ReturnType<typeof mapStateToProps> {}

class RenderHttpRouteDestinationsRaw extends React.PureComponent<Props> {
  private renderRows() {
    const { fields, services, activeNamespace } = this.props;

    const options: KAutoCompleteOption[] = [];
    services
      .filter((x) => {
        const ns = x.get("namespace");

        // TODO should we ignore the system namespaces??
        return (
          ns !== "default" &&
          ns !== "kalm-system" &&
          ns !== "kalm-operator" &&
          ns !== "kalm-imgconv" &&
          ns !== "kube-system" &&
          ns !== "istio-system" &&
          ns !== "cert-manager" &&
          ns !== "istio-operator"
        );
      })
      .forEach((svc) => {
        svc
          .get("ports")
          .filter((p) => {
            const appProtocol = p.get("appProtocol");
            return (
              appProtocol === PortProtocolHTTP ||
              appProtocol === PortProtocolHTTP2 ||
              appProtocol === PortProtocolHTTPS ||
              appProtocol === PortProtocolGRPC ||
              appProtocol === PortProtocolGRPCWEB
            );
          })
          .forEach((port) => {
            options.push({
              value: `${svc.get("name")}.${svc.get("namespace")}.svc.cluster.local:${port.get("port")}`,
              label: svc.get("name") + ":" + port.get("port") + `(${port.get("appProtocol")})`,
              group:
                svc.get("namespace") === activeNamespace ? `${svc.get("namespace")} (Current)` : svc.get("namespace"),
            });
          });
      });

    return fields.map((member, index) => {
      const target = fields.get(index);
      return (
        <Grid container spacing={2} key={index} alignItems="center">
          <Grid item xs={8} sm={8} md={6} lg={4} xl={4}>
            <Field
              name={`${member}.host`}
              component={KAutoCompleteSingleValue}
              label="Choose a target"
              validate={ValidatorRequired}
              options={options}
              noOptionsText={
                <Alert severity="warning">
                  <AlertTitle>No valid targets found.</AlertTitle>
                  <Typography>
                    If you can't find the target you want, please check if you have configured ports on the component.
                    Only components that have ports will appear in the options.
                  </Typography>
                </Alert>
              }
            />
          </Grid>
          {fields.length > 1 ? (
            <Grid item md={2}>
              <Field
                name={`${member}.weight`}
                component={KRenderSlider}
                label="Weight"
                step={1}
                min={0}
                max={10}
                disabled={fields.length <= 1}
              />
            </Grid>
          ) : null}
          <Grid item md={1}>
            <IconButtonWithTooltip
              tooltipPlacement="top"
              tooltipTitle="Delete"
              aria-label="delete"
              onClick={() => fields.remove(index)}
            >
              <DeleteIcon />
            </IconButtonWithTooltip>
          </Grid>
          {target.get("weight") === 0 ? (
            <Grid item md={3}>
              <Warning /> Requests won't go into this target since it has 0 weight.
            </Grid>
          ) : null}
        </Grid>
      );
    });
  }

  public render() {
    const {
      meta: { error, dirty, submitFailed },
    } = this.props;

    return (
      <div>
        {!!error && (dirty || submitFailed) ? (
          <Alert className={"alert"} severity="error">
            {error}
          </Alert>
        ) : null}
        {this.renderRows()}
      </div>
    );
  }
}

export const RenderHttpRouteDestinations = connect(mapStateToProps)(RenderHttpRouteDestinationsRaw);
