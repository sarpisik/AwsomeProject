import React, { Component } from 'react';
import { Platform } from 'react-native';
import { Notifications, Permissions } from 'expo';

import { compose } from 'recompose';
import { withNavigation } from 'react-navigation';
import { withFirebase } from './Firebase';

const withNotification = Component => {
  class WithNotification extends React.Component {
    constructor(props) {
      super(props);

      this.state = {isNotification: false};
    }

    componentDidMount() {
      if (this.askPermissions()) {

        if (Platform.OS === 'android') {
          Expo.Notifications.createChannelAndroidAsync('chat-messages', {
            name: 'Chat messages',
            sound: true,
          });
        }

        Notifications.addListener(this.onNotification);

        this.setState({isNotification: true});
      }
    }

    askPermissions = async () => {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return false;
      }
      return true;
    }

    sendNotificationImmediately = async (
      senderName,
      text,
      authUser,
      contactId,
      chatPath,
    ) => {
      this.state.isNotification && await Notifications.presentLocalNotificationAsync({
        title: senderName,
        body: text,
        data: {
          authUser: authUser,
          cid: contactId,
          contactName: senderName,
          chatPath: chatPath,
        },
        android: {
          channelId: 'chat-messages',
        },
        ios: {sound: true}
      });
    }

    onNotification = notification => {
      const { data, origin } = notification;

      // When the user tapped on notification
      origin === 'selected' &&
      // Redirect to chat ChatScreen component
      this.props.navigation.push('ChatScreen', {
        authUser: data.authUser,
        cid: data.cid,
        contactName: data.contactName,
        chatPath: data.chatPath,
        firebase: this.props.firebase,
      });
    }

    render() {
      return (
        <Component sendNotification = {this.sendNotificationImmediately} {...this.state} {...this.props} />
      )
    }
  }

  return compose(
    withFirebase,
    withNavigation,
  )(WithNotification);
};

export default withNotification;
