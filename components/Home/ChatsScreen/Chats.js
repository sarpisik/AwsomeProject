import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Text } from 'react-native'

import ChatList from './ChatList'

class Chats extends Component {
  state = {
    isLoadComplete: false
  }

  render() {
    const {
      authUser,
      authUser: { messagesList }
    } = this.props
    const { isLoadComplete, onChange } = this.props

    let ready = isLoadComplete && messagesList.every(this.onRenderList)
    return (
      <View style={{ flex: 1 }}>
        {ready ? (
          <ChatList authUser={authUser} data={messagesList} />
        ) : (
          <Text>You have no messages</Text>
        )}
      </View>
    )
  }
}

export default Chats
