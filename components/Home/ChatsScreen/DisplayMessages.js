import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, FlatList } from 'react-native'
import List from '../../List'

export default class DisplayMessages extends PureComponent {
  DisplayMessage = ({ item }) => {
    const { authUser, usersIDs } = this.props

    const getSentDate = new Date(item.createdAt).toLocaleDateString()
    const currentDate = new Date().toLocaleDateString()
    const showDate =
      getSentDate !== currentDate
        ? getSentDate
        : new Date(item.createdAt).toLocaleTimeString()

    // The color of text depends on isRead value
    const textColor =
      item.userId === authUser.uid
        ? item.isRead === 'true'
          ? styles.read
          : styles.unRead
        : styles.read

    return (
      <List
        title={usersIDs[item.userId] || item.userId}
        subTitle={item.text}
        image={authUser.photoURL}
        date={showDate}
        read={textColor}
        fontStyle={styles.text}
      />
    )
  }

  render() {
    const { messagesList, extraData, ...props } = this.props
    console.log('DisplayMessages rendered-----')

    return (
      <FlatList
        data={messagesList}
        extraData={extraData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={this.DisplayMessage}
        {...props}
      />
    )
  }
}

DisplayMessages.propTypes = {
  messagesList: PropTypes.array.isRequired,
  usersIDs: PropTypes.object.isRequired,
  authUser: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    photoURL: PropTypes.number
  }).isRequired
}

const styles = StyleSheet.create({
  text: {
    fontStyle: 'normal'
  },
  read: { color: 'navy' },
  unRead: { color: 'red' }
})
