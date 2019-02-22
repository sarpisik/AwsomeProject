import React from 'react'
import PropTypes from 'prop-types'
import { View, Text, StyleSheet } from 'react-native'
import { SearchBar } from 'react-native-elements'

import { compose } from 'recompose'
import { withHeader } from '../../HOCs/withHeader'
import { withAuthorization } from '../../Session'
import withForm from '../../HOCs/withForm'
import * as ROUTES from '../../constants'
import Profile from '../../Profile'
import Button from '../../Button'

const state = {
  display: false,
  email: '',
  id: '',
  name: '',
  photoURL: '',
  showLoading: false,
  isButtonLoading: false,
  error: null
}

const AddNewContactScreen = ({ email, error, showLoading, ...props }) => {
  const { authUser, firebase, history } = props

  const updateSearch = email => props.onChange({ email: email, error: null })

  const showResult = (userObj, action) => {
    const contactObject = {
      id: userObj.id || userObj.cid,
      email: userObj.email,
      name: userObj.name,
      photoURL: userObj.photoURL || ''
    }
    props.onChange({
      showLoading: false,
      display: true,
      buttonAction: action,
      ...contactObject
    })
  }

  const onSearch = async () => {
    if (email) {
      await props.onChange({ showLoading: true })
      let isContact = await authUser.mergedContactsList.find(
        contactObj => contactObj.email === email
      )

      if (isContact) {
        // Look for an existing chat record
        const chatRecord = await authUser.messagesList.find(
          obj => obj.contactId === isContact.cid
        )
        isContact.path = ((await chatRecord) && chatRecord.path) || null

        showResult(isContact, 'send')
      } else {
        const users = await firebase
          .users()
          .orderByChild('email')
          .equalTo(email)
          .once('value')

        const isUser = await users.val()
        // If searched email does exist in the users database
        if (isUser) {
          let user = Object.values(isUser)
          showResult(user[0], 'add')
        } else {
          // Throw error if the searched email does not exist.
          const error = {
            message: 'The email does not exist'
          }

          await props.onSubmit()
          props.onChange({ showLoading: false, error })
        }
      }
    }
  }

  const onSubmit = async () => {
    await props.onChange({ isButtonLoading: true })

    if (props.buttonAction === 'send') {
      await props.onSubmit()
      history.push({
        pathname: `/${ROUTES.CHAT_SCREEN}`,
        state: {
          contactName: props.name,
          cid: props.id,
          path: props.path
        }
      })
    } else {
      let contactObject = {
        cid: props.id,
        email: email,
        addedTime: firebase.serverValue.TIMESTAMP
      }
      // Save the searched user as a contact into authUser's contacts list
      const sendNewUser = await firebase
        .user(authUser.uid)
        .child('contactsList')
        .push(contactObject)

      // Fetch updated contacts list
      const snapshot = await firebase
        .user(authUser.uid)
        .child('contactsList')
        .once('value')
      const contacts = await snapshot.val()
      // Get the added time of last added contact
      const createdTime = await contacts[sendNewUser.key].addedTime

      // Create this object to send contact details screen
      contactObject.key = await sendNewUser.key
      contactObject.name = await props.name
      contactObject.addedTime = await new Date(createdTime).toUTCString()

      // Navigate to ContactScreen
      await props.onSubmit()
      history.replace({
        pathname: `${ROUTES.MAIN}${ROUTES.CONTACT_SCREEN}`,
        state: contactObject
      })
    }
  }

  return (
    <View style={[styles.container, styles.backgroundColor]}>
      <SearchBar
        placeholder="Type Email..."
        inputContainerStyle={styles.backgroundColor}
        inputStyle={styles.inputColor}
        searchIcon={styles.inputColor}
        placeholderTextColor={styles.inputColor.color}
        onChangeText={updateSearch}
        value={email}
        showLoading={showLoading}
        onSubmitEditing={onSearch}
      />
      {props.display && (
        <Profile imageURL={props.photoURL} userName={props.name}>
          <Button
            title={props.name || props.email}
            icon={{
              name: props.buttonAction,
              size: 25,
              color: styles.inputColor.color
            }}
            iconRight
            iconContainerStyle={styles.icon}
            onPress={onSubmit}
            loading={props.isButtonLoading}
          />
        </Profile>
      )}
      {error && (
        <Text style={[styles.inputColor, styles.text]}>{error.message}</Text>
      )}
    </View>
  )
}

export default compose(
  withForm(state),
  withHeader({ title: 'New Contact' }),
  withAuthorization
)(AddNewContactScreen)

AddNewContactScreen.propTypes = {
  authUser: PropTypes.object.isRequired,
  firebase: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backgroundColor: {
    backgroundColor: '#222'
  },
  inputColor: {
    color: '#61dafb'
  },
  text: {
    flex: 1
  },
  icon: {
    paddingLeft: 25
  }
})
