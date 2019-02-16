import React, { Component } from 'react'
import { View, Button } from 'react-native'
import ContactsList from './ContactsList'
import * as ROUTES from '../../constants'

// PARENT COMPONENT TO PASS AUTHUSER TO ITS CHILDREN
// - ContactsList
// -AddNewContactScreen
class Contacts extends Component {
  render() {
    const { authUser } = this.props
    return (
      <View style={{ justifyContent: 'center' }}>
        {authUser.mergedContactsList ? (
          <ContactsList data={authUser.mergedContactsList} />
        ) : (
          <Text>You have no contact...</Text>
        )}
      </View>
    )
  }
}

export default Contacts
