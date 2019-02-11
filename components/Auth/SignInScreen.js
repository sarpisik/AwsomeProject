import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  LayoutAnimation,
  Dimensions,
  ImageBackground,
  Text,
  StyleSheet
} from "react-native";
import { Input, Button } from "react-native-elements";

import { Font } from "expo";
import Icon from "react-native-vector-icons/FontAwesome";

import { compose } from "recompose";
import { withRouter } from "react-router-native";
import { withFirebase } from "../Firebase";

import * as ROUTES from "../constants";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const BG_IMAGE = require("../../assets/images/bg_screen1.jpg");

const INITIAL_STATE = {
  fontLoaded: false,
  email: "",
  password: "",
  // change with error
  showLoading: false,
  error: null
};

class SignInScreenBase extends React.Component {
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
    const { firebase, history } = this.props;
    const { email, password, showLoading } = this.state;

    this.setState({
      showLoading: true
    });

    // FIREBASE API
    firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(authUser => {
        setTimeout(() => {
          LayoutAnimation.easeInEaseOut();
          // Clear the form
          this.setState(state => ({ ...INITIAL_STATE, showLoading: false }));
          // Alert.alert('🎸', 'You rock');
          history.replace({ pathname: `/${ROUTES.HOME}` });
        }, 1500);
      })
      // PRINT ERROR
      .catch(error => {
        this.setState({ error, showLoading: false });
      });
  };

  render() {
    const { history, match } = this.props;
    const { email, password, showLoading, error } = this.state;

    const isInvalid = email === "" || password === "";

    return (
      <View style={styles.container}>
        <ImageBackground source={BG_IMAGE} style={styles.bgImage}>
          {this.state.fontLoaded ? (
            <View style={styles.loginView}>
              <View style={styles.loginTitle}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={styles.travelText}>CONTACT</Text>
                  <Text style={styles.plusText}>+</Text>
                </View>
              </View>

              <View style={styles.loginInput}>
                {/* EMAIL FIELD */}
                <Input
                  leftIcon={
                    <Icon
                      name="user-o"
                      color="rgba(171, 189, 219, 1)"
                      size={25}
                    />
                  }
                  containerStyle={{ marginVertical: 10 }}
                  onChangeText={email => this.setState({ email })}
                  value={email}
                  inputStyle={{ marginLeft: 10, color: "white" }}
                  keyboardAppearance="light"
                  placeholder="Email"
                  autoFocus={false}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  ref={input => (this.emailInput = input)}
                  onSubmitEditing={() => {
                    // this.setState({ email_valid: this.validateEmail(email) });
                    this.passwordInput.focus();
                  }}
                  blurOnSubmit={false}
                  placeholderTextColor="white"
                  errorStyle={{ textAlign: "center", fontSize: 12 }}
                  errorMessage={error && error.message}
                />

                {/* PASSWORD FIELD */}
                <Input
                  leftIcon={
                    <Icon
                      name="lock"
                      color="rgba(171, 189, 219, 1)"
                      size={25}
                    />
                  }
                  containerStyle={{ marginVertical: 10 }}
                  onChangeText={password => this.setState({ password })}
                  value={password}
                  inputStyle={{ marginLeft: 10, color: "white" }}
                  secureTextEntry={true}
                  keyboardAppearance="light"
                  placeholder="Password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                  returnKeyType="done"
                  ref={input => (this.passwordInput = input)}
                  blurOnSubmit={true}
                  placeholderTextColor="white"
                />
              </View>

              {/* SUBMIT BUTTON */}
              <Button
                title="LOG IN"
                activeOpacity={1}
                underlayColor="transparent"
                onPress={this.onSubmit}
                loading={showLoading}
                loadingProps={{ size: "small", color: "white" }}
                disabled={isInvalid}
                buttonStyle={{
                  height: 50,
                  width: 250,
                  backgroundColor: "transparent",
                  borderWidth: 2,
                  borderColor: "white",
                  borderRadius: 30
                }}
                containerStyle={{ marginVertical: 10 }}
                titleStyle={{ fontWeight: "bold", color: "white" }}
              />

              <View style={styles.footerView}>
                <Text style={{ color: "grey" }}>New here?</Text>
                <Button
                  title="Create an Account"
                  clear
                  activeOpacity={0.5}
                  titleStyle={{ color: "white", fontSize: 15 }}
                  containerStyle={{ marginTop: -10 }}
                  onPress={() => history.push(`${match.url}/${ROUTES.SIGN_UP}`)}
                />
              </View>
            </View>
          ) : (
            <Text>Loading...</Text>
          )}
        </ImageBackground>
        {/* CREATE ACCOUNT LINK */}
        {/* <View
          style={{
            flexDirection: "row",
            marginBottom: 20
          }}
        >
          <SignUpLink />
        </View> */}
        <Text>{}</Text>
      </View>
    );
  }
}

const SignInScreen = compose(
  withRouter,
  withFirebase
)(SignInScreenBase);

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  bgImage: {
    flex: 1,
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  loginView: {
    marginTop: 150,
    backgroundColor: "transparent",
    width: 250,
    height: 400
  },
  loginTitle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  travelText: {
    color: "white",
    fontSize: 30,
    fontFamily: "bold"
  },
  plusText: {
    color: "white",
    fontSize: 30,
    fontFamily: "regular"
  },
  loginInput: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  footerView: {
    marginTop: 20,
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  }
});
