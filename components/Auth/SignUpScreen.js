import React from 'react'
import PropTypes from 'prop-types'
import { LayoutAnimation } from 'react-native'

import FormContainer from '../FormContainer'

import { compose } from 'recompose'
import { withRouter } from 'react-router-native'
import { withFirebase } from '../Firebase'
import * as ROUTES from '../constants'

import { withHeader } from '../HOCs/withHeader'

const INITIAL_STATE = {
  isLoading: false,
  username: '',
  email: '',
  password: '',
  confirmationPassword: '',
  error: null
}

class SignUpScreenBase extends React.Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = () => {
    const { username, email, password } = this.state
    const { firebase, history } = this.props

    LayoutAnimation.easeInEaseOut()
    this.setState({ isLoading: true })

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
          LayoutAnimation.easeInEaseOut()
          this.setState({ isLoading: false })
          // Alert.alert('🎸', 'You rock');
          history.replace({ pathname: ROUTES.MAIN })
        }, 1500)
      })
      .catch(error => {
        // if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
        //   error.message = ERROR_MSG_ACCOUNT_EXISTS;
        // }

        this.setState({ error, isLoading: false })
      })
  }

  render() {
    const {
      isLoading,
      username,
      email,
      password,
      confirmationPassword,
      error
    } = this.state

    const isInvalid =
      password !== confirmationPassword ||
      username === '' ||
      email === '' ||
      password === ''

    const inputFields = [
      {
        refInput: input => (this.usernameInput = input),
        icon: 'user',
        value: username,
        onChangeText: username => this.setState({ username }),
        placeholder: 'Username',
        returnKeyType: 'next',
        errorMessage: error && error.message,
        onSubmitEditing: () => this.emailInput.focus()
      },
      {
        refInput: input => (this.emailInput = input),
        icon: 'envelope',
        value: email,
        onChangeText: email => this.setState({ email }),
        placeholder: 'Email',
        keyboardType: 'email-address',
        returnKeyType: 'next',
        errorMessage: error && error.message,
        onSubmitEditing: () => this.passwordInput.focus()
      },
      {
        refInput: input => (this.passwordInput = input),
        icon: 'lock',
        value: password,
        onChangeText: password => this.setState({ password }),
        placeholder: 'Password',
        secureTextEntry: true,
        returnKeyType: 'next',
        errorMessage: error && error.message,
        onSubmitEditing: () => this.confirmationPasswordInput.focus()
      },
      {
        refInput: input => (this.confirmationPasswordInput = input),
        icon: 'lock',
        value: confirmationPassword,
        onChangeText: confirmationPassword =>
          this.setState({ confirmationPassword }),
        placeholder: 'Confirm Password',
        secureTextEntry: true,
        returnKeyType: 'go',
        errorMessage: error && error.message,
        onSubmitEditing: () => this.onSubmit()
      }
    ]

    return (
      <FormContainer
        inputList={inputFields}
        buttonTitle="SIGN UP"
        isLoading={isLoading}
        isInvalid={isInvalid}
        onSubmit={this.onSubmit}
      />
    )
  }
}

SignUpScreenBase.propTypes = {}

const SignUpScreen = compose(
  withHeader({ title: 'Create A New Account', goBackTo: ROUTES.AUTH }),
  withRouter,
  withFirebase
)(SignUpScreenBase)

export default SignUpScreen
