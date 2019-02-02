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
  onNavigate = (authUser, chatObject) => {
    this.props.navigation.navigate(
      'ChatScreen',
      {
        contactName: chatObject.contactName, // Contact name for topbar
        cid: chatObject.contactId, // ContactID
        authUser: authUser, // User (Sender)
        chatPath: chatObject.path, // Path of chat obj in messages database
        firebase: this.props.firebase // APIs to interact server
      }
    );
  }

  render() {
    const { firebase } = this.props;
    const { navigate } = this.props.navigation;
    // console.log(this.props.navigation.state);

    return (
      <AuthUserContext.Consumer>
        {authUser => <View style={{justifyContent: "center", }}>

          {/* Pass authuser and firebase class */}
          <ChatList
            authUser={authUser}
            firebase={firebase}
            onNavigate={this.onNavigate}
          />

          <Button
            title="Go to Contacts"
            onPress={() => this.props.navigation.navigate('CONTACTS', {
              id: 50,
              name: 'UserOne',
              title: 'Contacts List'
            })}
          />
        </View>}
      </AuthUserContext.Consumer>
    );
  }
}

const condition = authUser => authUser != null;

export default compose(
  withAuthorization(condition)
)(Chats);
