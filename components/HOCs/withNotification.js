import React from 'react'
import { Platform } from 'react-native'
import { Notifications, Permissions } from 'expo'

import { compose } from 'recompose'
import { withRouter } from 'react-router-native'
import { withFirebase } from '../Firebase'

import * as ROUTES from '../constants'

const withNotification = Component => {
  class WithNotification extends React.Component {
    constructor(props) {
      super(props)

      this.state = { isNotification: false }
    }

    componentDidMount() {
      if (this.askPermissions()) {
        if (Platform.OS === 'android') {
          Expo.Notifications.createChannelAndroidAsync('chat-messages', {
            name: 'Chat messages',
            sound: true
          })
        }

        Notifications.addListener(this.onNotification)

        this.setState({ isNotification: true })
      }
    }

    // Permission asker to display notifications
    askPermissions = async () => {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      )
      let finalStatus = existingStatus
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
        finalStatus = status
      }
      if (finalStatus !== 'granted') {
        return false
      }
      return true
    }

    // Notification handler onPress
    onNotification = notification => {
      const { data, origin } = notification

      // When the user tapped on notification
      origin === 'selected' &&
        // Redirect to chat ChatScreen component
        this.props.history.push({
          pathname: `${ROUTES.MAIN}${ROUTES.CHAT_SCREEN}`,
          state: data
        })
    }

    // Notification creator & sender
    // Use this on wrapped component
    sendNotificationImmediately = async ({
      contactId,
      senderName,
      text,
      path
    }) => {
      this.state.isNotification &&
        (await Notifications.presentLocalNotificationAsync({
          title: senderName,
          body: text,
          data: {
            cid: contactId,
            contactName: senderName,
            path: path
          },
          android: {
            channelId: 'chat-messages'
          },
          ios: { sound: true }
        }))
    }

    render() {
      return (
        <Component
          sendNotification={this.sendNotificationImmediately}
          {...this.state}
          {...this.props}
        />
      )
    }
  }

  return compose(
    withFirebase,
    withRouter
  )(WithNotification)
}

export default withNotification
