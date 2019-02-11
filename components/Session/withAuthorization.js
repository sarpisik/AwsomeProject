import React from "react";

// React.createContext
import { AuthUserContext } from "./index";
import { withRouter } from "react-router-native";
import { withFirebase } from "../Firebase";
import { compose } from "recompose";
import * as ROUTES from "../constants";

const condition = authUser => authUser != null;

const withAuthorization = Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      const { firebase, history } = this.props;
      // If authUser does not exist then redirect to login page
      this.listener = firebase.onAuthUserListener(
        authUser => {
          if (!condition(authUser)) {
            history.replace({ pathname: `/${ROUTES.AUTH}` });
          }
        },
        () => history.replace({ pathname: `/${ROUTES.AUTH}` })
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser =>
            condition(authUser) ? (
              <Component {...this.props} authUser={authUser} />
            ) : null
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return compose(
    withRouter,
    withFirebase
  )(WithAuthorization);
};

export default withAuthorization;
