import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";

import { compose } from "recompose";
import { withRouter } from "react-router-native";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../constants";

import { withHeader } from "../HOCs/withHeader";

const INITIAL_STATE = {
  name: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  error: null
};

class SignUpScreenBase extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = () => {
    const { name, email, passwordOne } = this.state;
    const { firebase, history } = this.props;

    firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      // Create user in realtime database
      .then(authUser =>
        firebase.user(authUser.user.uid).set({
          id: authUser.user.uid,
          email,
          name: name,
          contactsList: [],
          chatList: [],
          creationTime: firebase.serverValue.TIMESTAMP,
          isAdmin: false
        })
      )
      // Send email verification
      // .then(() => firebase.doSendEmailVerification())
      // Clear the form and redirect to HOME stack
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        history.replace({ pathname: `/${ROUTES.HOME}` });
      })
      .catch(error => {
        // if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
        //   error.message = ERROR_MSG_ACCOUNT_EXISTS;
        // }

        this.setState({ error });
      });
  };

  render() {
    const { name, email, passwordOne, passwordTwo, error } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      name === "" ||
      email === "" ||
      passwordOne === "";

    return (
      <View style={styles.container}>
        <TextInput
          placeholder="Name"
          style={styles.input}
          onChangeText={name => this.setState({ name })}
          // onSubmitEditing
          value={name}
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          onChangeText={email => this.setState({ email })}
          // onSubmitEditing
          value={email}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          onChangeText={passwordOne => this.setState({ passwordOne })}
          // onSubmitEditing
          value={passwordOne}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          onChangeText={passwordTwo => this.setState({ passwordTwo })}
          // onSubmitEditing
          value={passwordTwo}
        />

        <View style={styles.subContainer}>
          <Button onPress={this.onSubmit} title="Submit" disabled={isInvalid} />
          <Button
            onPress={() => this.setState({ ...INITIAL_STATE })}
            title="Reset"
            disabled={isInvalid}
          />
        </View>

        <Text>{error && error.message}</Text>
      </View>
    );
  }
}

SignUpScreenBase.propTypes = {};

const SignUpLinkBase = ({ match, history }) => {
  console.log("history from signuplinkbas ,", match);
  return (
    <>
      <Text
        style={{
          padding: 5,
          alignSelf: "center"
        }}
      >
        Don't have an account?
      </Text>
      <Button
        title="Sign Up"
        onPress={() => history.push(`${match.url}/${ROUTES.SIGN_UP}`)}
      />
    </>
  );
};

// Get navigation props
const SignUpLink = withRouter(SignUpLinkBase);

const SignUpScreen = compose(
  withHeader({ title: "Create A New Account" }),
  withRouter,
  withFirebase
)(SignUpScreenBase);

// Using at App.js in AuthStack
export default SignUpScreen;

// Export to Use at SignIn screen
export { SignUpLink };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subContainer: {
    flexDirection: "column",
    width: "80%",
    backgroundColor: "green"
  },
  input: {
    height: 40,
    width: "80%",
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    marginBottom: 20
  }
});
