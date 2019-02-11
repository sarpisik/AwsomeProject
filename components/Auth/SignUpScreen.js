import React from "react";
import PropTypes from "prop-types";
import {
  Alert,
  LayoutAnimation,
  TouchableOpacity,
  Dimensions,
  Image,
  UIManager,
  KeyboardAvoidingView,
  StyleSheet,
  ScrollView,
  Text,
  View
} from "react-native";

import { Font } from "expo";
import { Input, Button } from "react-native-elements";

import Icon from "react-native-vector-icons/SimpleLineIcons";

import { compose } from "recompose";
import { withRouter } from "react-router-native";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../constants";

import { withHeader } from "../HOCs/withHeader";

// Enable LayoutAnimation on Android
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const FormInput = props => {
  const { icon, refInput, ...otherProps } = props;
  return (
    <Input
      {...otherProps}
      ref={refInput}
      inputContainerStyle={styles.inputContainer}
      leftIcon={<Icon name={icon} color="#7384B4" size={18} />}
      inputStyle={styles.inputStyle}
      autoFocus={false}
      autoCapitalize="none"
      keyboardAppearance="dark"
      errorStyle={styles.errorInputStyle}
      autoCorrect={false}
      blurOnSubmit={false}
      placeholderTextColor="#7384B4"
    />
  );
};

const INITIAL_STATE = {
  isLoading: false,
  fontLoaded: false,
  username: "",
  email: "",
  password: "",
  confirmationPassword: "",
  error: null
};

class SignUpScreenBase extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  async componentDidMount() {
    await Font.loadAsync({
      regular: require("../../assets/fonts/Montserrat-Regular.ttf"),
      light: require("../../assets/fonts/Montserrat-Light.ttf"),
      bold: require("../../assets/fonts/Montserrat-Bold.ttf")
    });

    this.setState({ fontLoaded: true });
  }

  onSubmit = () => {
    const { username, email, password } = this.state;
    const { firebase, history } = this.props;

    LayoutAnimation.easeInEaseOut();
    this.setState({ isLoading: true });

    firebase
      .doCreateUserWithEmailAndPassword(email, password)
      // Create user in realtime database
      .then(authUser =>
        firebase.user(authUser.user.uid).set({
          id: authUser.user.uid,
          email,
          name: username,
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
        setTimeout(() => {
          LayoutAnimation.easeInEaseOut();
          this.setState({ isLoading: false });
          // Alert.alert('🎸', 'You rock');
          history.replace({ pathname: `/${ROUTES.HOME}` });
        }, 1500);
      })
      .catch(error => {
        // if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
        //   error.message = ERROR_MSG_ACCOUNT_EXISTS;
        // }

        this.setState({ error, isLoading: false });
      });
  };

  render() {
    const {
      isLoading,
      username,
      email,
      password,
      confirmationPassword,
      error,
      fontLoaded
    } = this.state;

    const isInvalid =
      password !== confirmationPassword ||
      username === "" ||
      email === "" ||
      password === "";

    return !fontLoaded ? (
      <View>
        <Text> Loading... </Text>
      </View>
    ) : (
      <ScrollView
        scrollEnabled={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        <KeyboardAvoidingView
          behavior="position"
          contentContainerStyle={styles.formContainer}
        >
          <Text style={styles.signUpText}>Sign up</Text>
          <View style={{ width: "80%", alignItems: "center" }}>
            {/* USERNAME */}
            <FormInput
              refInput={input => (this.usernameInput = input)}
              icon="user"
              value={username}
              onChangeText={username => this.setState({ username })}
              placeholder="Username"
              returnKeyType="next"
              errorMessage={
                // usernameValid ? null : "Your username can't be blank"
                error && error.message
              }
              onSubmitEditing={() => {
                // this.validateUsername();
                this.emailInput.focus();
              }}
            />
            {/* EMAIL */}
            <FormInput
              refInput={input => (this.emailInput = input)}
              icon="envelope"
              value={email}
              onChangeText={email => this.setState({ email })}
              placeholder="Email"
              keyboardType="email-address"
              returnKeyType="next"
              errorMessage={
                // emailValid ? null : 'Please enter a valid email address'
                error && error.message
              }
              onSubmitEditing={() => {
                // this.validateEmail();
                this.passwordInput.focus();
              }}
            />
            {/* PASSWORD ONE */}
            <FormInput
              refInput={input => (this.passwordInput = input)}
              icon="lock"
              value={password}
              onChangeText={password => this.setState({ password })}
              placeholder="Password"
              secureTextEntry
              returnKeyType="next"
              errorMessage={
                // passwordValid ? null : 'Please enter at least 8 characters'
                error && error.message
              }
              onSubmitEditing={() => {
                // this.validatePassword();
                this.confirmationPasswordInput.focus();
              }}
            />

            {/* PASSWORD CONFIRMATION */}
            <FormInput
              refInput={input => (this.confirmationPasswordInput = input)}
              icon="lock"
              value={confirmationPassword}
              onChangeText={confirmationPassword =>
                this.setState({ confirmationPassword })
              }
              placeholder="Confirm Password"
              secureTextEntry
              errorMessage={error && error.message}
              returnKeyType="go"
              onSubmitEditing={() => {
                // this.validateConfirmationPassword();
                this.onSubmit();
              }}
            />
          </View>

          {/* SUBMIT BUTTON */}
          <Button
            loading={isLoading}
            title="SIGNUP"
            containerStyle={{ flex: -1 }}
            buttonStyle={styles.signUpButton}
            ViewComponent={require("expo").LinearGradient}
            linearGradientProps={{
              colors: ["#FF9800", "#F44336"],
              start: [1, 0],
              end: [0.2, 0]
            }}
            titleStyle={styles.signUpButtonText}
            onPress={this.onSubmit}
            disabled={isInvalid}
          />
        </KeyboardAvoidingView>
        {/* <View style={styles.loginHereContainer}>
            <Text style={styles.alreadyAccountText}>
              Already have an account.
          </Text>
            <Button
              title="Login here"
              titleStyle={styles.loginHereText}
              containerStyle={{ flex: -1 }}
              buttonStyle={{ backgroundColor: 'transparent' }}
              underlayColor="transparent"
              onPress={() => Alert.alert('🔥', 'You can login here')}
            />
          </View> */}
      </ScrollView>
    );
  }
}

SignUpScreenBase.propTypes = {};

const SignUpScreen = compose(
  withHeader({ title: "Create A New Account" }),
  withRouter,
  withFirebase
)(SignUpScreenBase);

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 20,
    backgroundColor: "#293046",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: "center",
    justifyContent: "space-around"
  },
  formContainer: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center"
  },
  signUpText: {
    color: "white",
    fontSize: 28,
    fontFamily: "light"
  },
  whoAreYouText: {
    color: "#7384B4",
    fontFamily: "bold",
    fontSize: 14
  },
  userTypesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: SCREEN_WIDTH,
    alignItems: "center"
  },
  userTypeItemContainer: {
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5
  },
  userTypeItemContainerSelected: {
    opacity: 1
  },
  userTypeMugshot: {
    margin: 4,
    height: 70,
    width: 70
  },
  userTypeMugshotSelected: {
    height: 100,
    width: 100
  },
  userTypeLabel: {
    color: "yellow",
    fontFamily: "bold",
    fontSize: 11
  },
  inputContainer: {
    paddingLeft: 8,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(110, 120, 170, 1)",
    height: 45,
    marginVertical: 10
  },
  inputStyle: {
    flex: 1,
    marginLeft: 10,
    color: "white",
    fontFamily: "light",
    fontSize: 16
  },
  errorInputStyle: {
    marginTop: 0,
    textAlign: "center",
    color: "#F44336"
  },
  signUpButtonText: {
    fontFamily: "bold",
    fontSize: 13
  },
  signUpButton: {
    width: 250,
    borderRadius: 50,
    height: 45
  },
  loginHereContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  alreadyAccountText: {
    fontFamily: "lightitalic",
    fontSize: 12,
    color: "white"
  },
  loginHereText: {
    color: "#FF9800",
    fontFamily: "lightitalic",
    fontSize: 12
  }
});
