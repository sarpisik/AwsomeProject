import React from 'react'
import PropTypes from 'prop-types'
import { View, Text, StyleSheet } from 'react-native'

import { compose } from 'recompose'
import { withHeader } from '../../HOCs/withHeader'
import { withAuthorization } from '../../Session'
import withForm from '../../HOCs/withForm'
import FormContainer from '../../FormContainer'

const INITIAL_STATE = {
  password: '',
  confirmationPassword: '',
  isLoading: false,
  error: null,
  success: false
}

const PasswordChange = ({
  password,
  confirmationPassword,
  isLoading,
  error,
  success,
  ...props
}) => {
  let passwordInput = React.createRef()
  let confirmationPasswordInput = React.createRef()

  const onSubmit = async () => {
    try {
      await props.onChange({ isLoading: true })
      await props.firebase.doPasswordUpdate(password)
      await props.onChange({ ...INITIAL_STATE, success: true })
    } catch (error) {
      props.onChange({ error, isLoading: false })
    }
  }

  const isInvalid = password !== confirmationPassword || password === ''

  const inputFields = [
    {
      refInput: passwordInput,
      icon: 'lock',
      value: password,
      onChangeText: password => props.onChange({ password }),
      placeholder: 'Password',
      secureTextEntry: true,
      returnKeyType: 'next',
      errorMessage: error && error.message,
      onSubmitEditing: () => confirmationPasswordInput.current.focus()
    },
    {
      refInput: confirmationPasswordInput,
      icon: 'lock',
      value: confirmationPassword,
      onChangeText: confirmationPassword =>
        props.onChange({ confirmationPassword }),
      placeholder: 'Confirm Password',
      secureTextEntry: true,
      returnKeyType: 'done'
      // onSubmitEditing: () => onSubmit()
    }
  ]
  return (
    <>
      {success && (
        <View style={styles.container}>
          <Text style={styles.text}>
            The Password Has Been Changed Successfully!
          </Text>
        </View>
      )}
      <FormContainer
        inputList={inputFields}
        buttonTitle="SUBMIT"
        isLoading={isLoading}
        isInvalid={isInvalid}
        onSubmit={onSubmit}
      />
    </>
  )
}

export default compose(
  withForm(INITIAL_STATE),
  withHeader({ title: 'Change Password' }),
  withAuthorization
)(PasswordChange)

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 75,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#61dafb'
  },
  text: {
    color: '#61dafb',
    fontSize: 16
  }
})
