// TODO: set password reset
import React, { Component } from "react";
import { View } from "react-native";
import { Route, Switch } from "react-router-native";
import * as ROUTES from "../constants";
import SignInScreen from "./SignInScreen";
import SignUpScreen from "./SignUpScreen";

// Links for lazy load pages
const pages = {
  [ROUTES.SIGN_UP]: SignUpScreen
  // [ROUTES.SIGN_IN]: SignInScreen
};

// Run page by referred link
const Page = ({ match }) => {
  const Component = pages[match.params.screenId];
  // console.log("match from auth ,", match);
  return <Component />;
};

export class Auth extends Component {
  render() {
    const { match } = this.props;
    console.log("match from auth ,", match);

    return (
      <View style={{ flex: 1 }}>
        <Switch>
          <Route exact path={`${match.path}`} component={SignInScreen} />
          <Route path={`${match.path}/:screenId`} component={Page} />
        </Switch>
      </View>
    );
  }
}

export default Auth;
