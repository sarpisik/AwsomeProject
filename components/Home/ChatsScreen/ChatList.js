import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { FlatList } from 'react-native'
import { Link } from 'react-router-native'
import * as ROUTES from '../../constants'
import List from '../../List'

checkList = list => (list.messages[0] ? true : false)

// CHAT LIST
class ChatList extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      sortedMessagesList: []
    }
  }

  static getDerivedStateFromProps(props, state) {
    const {
      isChatsLoadComplete,
      onLoader,
      authUser: { messagesList, chatList }
    } = props

    // If authUser has no any chats to display...
    Object.keys(chatList).length ||
      // Then shut down loading screen
      onLoader({ isLoadComplete: true })

    // Conditions for initial rendering
    if (isChatsLoadComplete && messagesList.every(checkList)) {
      // Sort list by latest text at top
      let sortedMessagesList = [...messagesList]
      // sortedMessagesList.sort(
      //   (firstObj, secondObj) =>
      //     secondObj.messages[0].createdAt - firstObj.messages[0].createdAt
      // )
      return { sortedMessagesList }
    }

    if (isChatsLoadComplete && !messagesList.every(checkList)) {
      let sortedMessagesList = []
      return sortedMessagesList
    }
    return null
  }

  renderItem = ({ item }) => {
    const { authUser } = this.props

    // If the loading screen displaying...
    this.props.isLoadComplete ||
      // Then shut down loading screen
      this.props.onLoader({
        isLoadComplete: true
      })

    const getSentDate = new Date(
      item.messages[0].createdAt
    ).toLocaleDateString()
    const currentDate = new Date().toLocaleDateString()
    const showDate =
      getSentDate !== currentDate
        ? getSentDate
        : new Date(item.messages[0].createdAt).toLocaleTimeString()

    const unReadMessagesCount = item.messages.filter(
      textObj => textObj.userId !== authUser.uid && textObj.isRead === 'false'
    ).length

    return (
      <Link
        to={{
          pathname: `${ROUTES.MAIN}${ROUTES.CHAT_SCREEN}`,
          state: {
            contactName: item.name || item.userEmail,
            cid: item.contactId,
            path: item.path
          }
        }}>
        <List
          title={item.name || item.userEmail}
          subTitle={item.messages[0].text}
          image={authUser.photoURL}
          date={showDate}
          line={1}
          badge={unReadMessagesCount}
        />
      </Link>
    )
  }

  render() {
    const { sortedMessagesList } = this.state

    return sortedMessagesList.length > 0 ? (
      <FlatList
        data={sortedMessagesList}
        extraData={this.state}
        keyExtractor={(item, index) => index.toString()}
        renderItem={this.renderItem}
      />
    ) : null
  }
}

export default ChatList
