import { AppBar, createStyles, Divider, IconButton, Menu, MenuItem, Theme } from "@material-ui/core";
import blue from "@material-ui/core/colors/blue";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { WithStyles, withStyles } from "@material-ui/styles";
import { logoutAction } from "actions/auth";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "reducers";
import { TDispatch } from "types";
import { FlexRowItemCenterBox } from "widgets/Box";
import { loadApplicationsAction } from "../actions/application";
import SettingsIcon from "@material-ui/icons/Settings";
import { NavLink } from "react-router-dom";
import { IconButtonWithTooltip } from "../widgets/IconButtonWithTooltip";
import { ConsoleIcon, LogIcon } from "widgets/Icon";

export const APP_BAR_HEIGHT = 48;

const mapStateToProps = (state: RootState) => {
  const activeNamespace = state.get("namespaces").get("active");

  const auth = state.get("auth");
  const isAdmin = auth.get("isAdmin");
  const entity = auth.get("entity");
  return {
    activeNamespace,
    isAdmin,
    entity
  };
};

const styles = (theme: Theme) =>
  createStyles({
    appBar: {
      color: "white",
      backgroundColor: blue[500],
      position: "fixed",
      top: "0px",
      transition: "0.2s",
      height: APP_BAR_HEIGHT,
      zIndex: 1202
    },
    barContainer: {
      height: "100%",
      width: "100%",
      margin: "0 auto",
      position: "relative",
      padding: "0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    barTitle: {
      color: "inherit",
      fontSize: "18px",
      fontWeight: "normal",
      padding: "10px 0",
      "&:hover": {
        color: "inherit"
      }
    },
    barRight: {
      display: "flex",
      alignItems: "center",
      "& > *": {
        marginLeft: "2px"
      }
    },
    barAvatar: {
      cursor: "pointer"
    }
  });

interface Props extends WithStyles<typeof styles>, ReturnType<typeof mapStateToProps> {
  dispatch: TDispatch;
  title: string;
}

interface State {
  authMenuAnchorElement: null | HTMLElement;
}

class AppBarComponentRaw extends React.PureComponent<Props, State> {
  private headerRef = React.createRef<React.ReactElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      authMenuAnchorElement: null
    };
  }

  public componentDidMount() {
    this.props.dispatch(loadApplicationsAction());
  }

  renderAuthEntity() {
    const { entity } = this.props;
    const { authMenuAnchorElement } = this.state;
    return (
      <div>
        <IconButton
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            this.setState({ authMenuAnchorElement: event.currentTarget });
          }}
          color="inherit">
          <AccountCircle />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={authMenuAnchorElement}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          open={Boolean(authMenuAnchorElement)}
          onClose={() => {
            this.setState({ authMenuAnchorElement: null });
          }}>
          <MenuItem disabled>Auth as {entity}</MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              this.props.dispatch(logoutAction());
            }}>
            Logout
          </MenuItem>
        </Menu>
      </div>
    );
  }

  render() {
    const { classes, title, activeNamespace } = this.props;

    return (
      <AppBar ref={this.headerRef} id="header" position="relative" className={classes.appBar}>
        <div className={classes.barContainer}>
          <FlexRowItemCenterBox>
            <Link className={classes.barTitle} to="/">
              {title}
            </Link>
          </FlexRowItemCenterBox>
          <div className={classes.barRight}>
            <IconButtonWithTooltip
              tooltipTitle="Shell"
              color="inherit"
              component={NavLink}
              to={`/applications/${activeNamespace}/shells`}>
              <ConsoleIcon />
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
              tooltipTitle="Logs"
              color="inherit"
              component={NavLink}
              to={`/applications/${activeNamespace}/logs`}>
              <LogIcon />
            </IconButtonWithTooltip>
            <IconButtonWithTooltip tooltipTitle="Settings" color="inherit" component={NavLink} to={"/roles"}>
              <SettingsIcon />
            </IconButtonWithTooltip>
            <Divider orientation="vertical" flexItem color="inherit" />
            <div className={classes.barAvatar}>{this.renderAuthEntity()}</div>
          </div>
        </div>
      </AppBar>
    );
  }
}

export const AppBarComponent = connect(mapStateToProps)(withStyles(styles)(AppBarComponentRaw));
