// TODO: Set message read process functionality
// TODO: Set one HOC to listen data
// TODO: Scroll to bottom on ChatScreen
// TODO: navigate to ChatScreen onclick notification

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Button,
} from 'react-native';

import { compose } from 'recompose';
import { withAuthorization } from '../Auth/Session';
import { AuthUserContext } from '../Auth/Session';

import ChatList from './ChatList';





class Chats extends Component {
  componentDidMount() {
    console.log("Chats mounted");
  }

  componentWillUnmount() {
    console.log("Chats unmounted");
  }

  // Using in ChatList component
  // to navigate to ChatScreen
  onNavigate = chatObject => {
    this.props.navigation.navigate(
      'ChatScreen',
      {
        contactName: chatObject.contactName,
        cid: chatObject.cid, // ContactID
        path: chatObject.path,
      }
    );
  }

  render() {
    const {authUser, navigation:{ navigate }} = this.props;

    return (
      <View style={{justifyContent: "center", }}>

        <ChatList
          data={authUser.messagesList}
          // firebase={firebase}
          onNavigate={this.onNavigate}
        />

        <Button
          title="Go to Contacts"
          onPress={() => navigate('CONTACTS', {
            id: 50,
            name: 'UserOne',
            title: 'Contacts List'
          })}
        />
      </View>
    );
  }
}

const condition = authUser => authUser != null;

export default compose(
  withAuthorization(condition)
)(Chats);
