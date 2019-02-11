import React from "react";
import { Button } from "react-native";

import { compose } from "recompose";
import { withRouter } from "react-router-native";
import { withFirebase } from "../Firebase";

import * as ROUTES from "../constants";

const SignOut = ({ firebase, history }) => {
  const signOut = _ => {
    // FIREBASE API
    firebase.doSignOut().then(() => {
      // REDIRECT TO HOME
      history.entries = [];
      history.index = -1;

      history.push(`/${ROUTES.AUTH}`);
    });
  };

  return <Button title="Sign Out" onPress={signOut} />;
};

export default compose(
  withFirebase,
  withRouter
)(SignOut);
