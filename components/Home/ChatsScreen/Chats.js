import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Text } from 'react-native'

import ChatList from './ChatList'

class Chats extends Component {
  onRenderList = list => list.messages.length > 0

  render() {
    const {
      authUser,
      authUser: { messagesList }
    } = this.props
    return (
      <View style={{ flex: 1 }}>
        {messagesList.every(this.onRenderList) ? (
          <ChatList authUser={authUser} data={messagesList} />
        ) : (
          <Text>You have no messages</Text>
        )}
      </View>
    )
  }
}

export default Chats
