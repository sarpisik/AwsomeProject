import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { FlatList } from 'react-native'
import { Link } from 'react-router-native'
import * as ROUTES from '../../constants'
import List from '../../List'

// CHAT LIST
class ChatList extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      messagesList: props.messages
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.messages !== state.messagesList) {
      return { messagesList: props.messages }
    }

    return null
  }

  renderItem = ({ item }) => {
    const { authUser, contacts } = this.props

    const contact =
      contact && contacts.find(user => user.cid === item.contactId)

    const getSentDate = new Date(
      item.messagesList[0].createdAt
    ).toLocaleDateString()

    const currentDate = new Date().toLocaleDateString()

    const showDate =
      // If the sent date is past...
      getSentDate !== currentDate
        ? // Then display sent date
          getSentDate
        : // or display sent time as hour & minute
          new Date(item.messagesList[0].createdAt).toLocaleTimeString()

    // Display unread messages badge
    const unReadMessagesCount = item.messagesList.filter(
      textObj => textObj.userId !== authUser.uid && textObj.isRead === 'false'
    ).length

    return (
      <Link
        to={{
          pathname: `${ROUTES.MAIN}${ROUTES.CHAT_SCREEN}`,
          state: {
            contactName: (contact && contact.name) || item.contactEmail,
            cid: item.contactId,
            path: item.path,
            messagesList: item.messagesList
          }
        }}>
        <List
          title={(contact && contact.name) || item.contactEmail}
          subTitle={item.messagesList[0].text}
          image={authUser.photoURL}
          date={showDate}
          line={1}
          badge={unReadMessagesCount}
        />
      </Link>
    )
  }

  render() {
    const { messagesList } = this.state
    if (messagesList)
      return (
        <FlatList
          data={messagesList}
          extraData={this.state}
          keyExtractor={(item, index) => index.toString()}
          renderItem={this.renderItem}
        />
      )
    return null
  }
}

export default ChatList
