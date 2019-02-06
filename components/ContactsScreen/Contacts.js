import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, FlatList, Text, TextInput, Button, TouchableOpacity } from 'react-native';

import { compose } from 'recompose';
import { withAuthorization } from '../Auth/Session';

import ContactsList from './ContactsList';


// PARENT COMPONENT TO PASS AUTHUSER TO ITS CHILDREN
// - ContactsList
// -AddNewContactScreen
class Contacts extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('title', 'Contacts'),
  });

  // When pressed on a contact in ContactsList component
  onNavigate = contact => {
    const { navigate } = this.props.navigation;

    // Navigate to ContactScreen
    // to show details of pressed contact
    navigate('ContactScreen', {
      cid: contact.cid,
      name: contact.name,
      email: contact.email,
      addedTime: new Date(contact.addedTime).toUTCString(),
    })
  }

  render() {
    const { firebase, authUser } = this.props;
    const { navigate } = this.props.navigation;

    return (
      <View style={{ justifyContent: "center" }}>

        <ContactsList
          data={authUser.mergedContactsList}
          onNavigate={this.onNavigate}
        />

        <Button
          title="Add New Contact"
          onPress={() => navigate('AddNewContactScreen', {
            authUser: authUser,
            firebase: this.props.firebase,
            title: 'Add New Contact'
          })}
        />
      </View>
    );
  }
}
const condition = authUser => authUser != null;

export default compose(
  withAuthorization(condition)
)(Contacts);
