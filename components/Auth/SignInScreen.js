import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

import { compose } from 'recompose';
import { withNavigation } from 'react-navigation';
import { withFirebase } from '../Firebase';

import { SignUpLink } from './SignUpScreen';

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

class SignInScreenBase extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = () => {
    const { firebase, navigation } = this.props;
    const {
      email,
      password
    } = this.state;

    // FIREBASE API
    firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(authUser => {

        // Clear the form
        this.setState({ ...INITIAL_STATE });

        // Redirect to CHATS tab in AppStack
        navigation.navigate('CHATS');
      })

      // PRINT ERROR
      .catch(error => {
        this.setState({ error });
      });
    }

  render() {
    const {
      email,
      password,
      error
    } = this.state;

    const isInvalid =
      email === '' ||
      password === '';

      return (
        <View style={styles.container}>

          {/* EMAIL */}
          <TextInput
            placeholder="Email"
            style={styles.input}
            onChangeText={(email) => this.setState({email})}
            value={email}
          />

          {/* PASSWORD */}
          <TextInput
            placeholder="Password"
            style={styles.input}
            onChangeText={(password) => this.setState({password})}
            // onSubmitEditing
            value={password}
          />

          {/* CREATE ACCOUNT LINK */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 20
          }}>
            <SignUpLink />
          </View>

          <View style={styles.subContainer}>
            <Button
              onPress={this.onSubmit}
              title="Submit"
              disabled={isInvalid}
            />

            <Button
              onPress={() => this.setState({...INITIAL_STATE})}
              title="Reset"
              disabled={isInvalid}
            />
          </View>

          <Text>
            {error && error.message}
          </Text>
        </View>
      );
  }
}

const SignInScreen  = compose(
  withNavigation,
  withFirebase
)(SignInScreenBase);

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  subContainer: {
    flexDirection: 'column',
    width: '80%',
    backgroundColor: 'green',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
});

// export { SignInForm };
