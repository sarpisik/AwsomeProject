import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native'
import { Entypo } from '@expo/vector-icons'

import { withAuthorization } from '../../Session'
import DisplayMessages from './DisplayMessages'
import Header from '../../HOCs/withHeader'

const iconStyle = {
  color: '#61dafb',
  size: 25
}

class ChatScreen extends Component {
  constructor(props) {
    super(props)

    const {
      authUser,
      state: { contactName, cid, path, messagesList }
    } = props

    this.state = {
      text: '',
      messagesList: messagesList || [],
      usersIDs: {
        [cid]: contactName,
        [authUser.uid]: authUser.name
      },
      chatPath: path || '',
      isLoading: false,
      isFetchMessage: true,
      error: null
    }

    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 50
    }

    this.isReadCount
  }

  static getDerivedStateFromProps(props, state) {
    const {
      messages,
      state: { cid }
    } = props

    const isChatList = messages && messages.find(obj => obj.contactId === cid)

    const messagesList = (isChatList && isChatList.messagesList) || []

    if (messagesList !== state.messagesList) {
      return {
        messagesList
      }
    }
    return null
  }

  componentDidMount = () => {
    this.state.chatPath && this.onReadMessage()
  }

  componentDidUpdate = () => {
    this.state.chatPath && this.onReadMessage()
  }

  onReadMessage = () => {
    const {
      firebase,
      state: { cid }
    } = this.props
    const { chatPath, messagesList } = this.state

    messagesList
      .filter(
        chatObject => chatObject.userId === cid && chatObject.isRead === 'false'
      )
      .forEach(chatObject => {
        firebase
          .message(chatPath)
          .child(`messages/${chatObject.key}/isRead`)
          .set('true', async error => {
            if (error) {
              console.log(error)
            } else {
              this.props.onReadMessages(
                chatObject.index,
                chatObject.key,
                'true'
              )
            }
          })
      })
  }

  // On press Send button or submit input
  onSendMessage = async () => {
    const {
      firebase,
      authUser,
      state: { cid, path, contactEmail }
    } = this.props
    const { usersIDs } = this.state

    let chatPath = path || this.state.path

    // Use chat path if it exist already
    if (chatPath) {
      this.onCreateMessage(chatPath)
    } else {
      // If there is no chatPath already
      // create new chat object in messages database
      const newChatPath = await firebase.messages().push(
        {
          users: Object.keys(usersIDs),
          chatCreatedDate: firebase.serverValue.TIMESTAMP
        },
        error => error && this.setState({ error })
      )

      // And also save this path into the both users database
      // for later uses
      // First save the path into authUser's database
      await this.createChatObjectForUser(
        authUser.uid,
        cid,
        contactEmail,
        newChatPath.key
      )
      // Then save the path into contact's database
      await this.createChatObjectForUser(
        cid,
        authUser.uid,
        authUser.email,
        newChatPath.key
      )

      // Store the new chat object's path in the state for reusebility
      await this.setState({
        path: newChatPath.key
      })

      // Then use the path of new created chat object
      // to interact in every messages
      this.onCreateMessage(this.state.path)
    }
  }

  onCreateMessage = async path => {
    const { firebase, authUser } = this.props

    const messageObject = await {
      text: this.state.text,
      userId: authUser.uid,
      isRead: 'false',
      createdAt: firebase.serverValue.TIMESTAMP
    }

    await firebase
      .message(path)
      .child('messages')
      .push(messageObject, error => {
        if (error) {
          this.setState({ error })
        } else {
          console.log('Message Sent!')
        }
      })

    // Clear the input field after update
    this.setState({
      text: ''
    })
  }

  createChatObjectForUser = (userId, contactId, email, path) => {
    const { firebase } = this.props

    // Prepare the object which will send to
    // user's specified database
    const newChatObjectRecord = {
      contactId: contactId,
      contactEmail: email,
      path: path
    }

    // Then connect to userId's database
    const currentUser = firebase.user(userId).child('chatList')

    // and save the new object in messages record array
    currentUser.push(newChatObjectRecord)
  }

  onViewableItemsChanged = ({ changed }) => {
    this.state.isFetchMessage &&
      changed[0].index === this.state.messagesList.length - 1 &&
      this.state.messagesList.length >= this.props.limit &&
      this.setState({ isLoading: true }, () => {
        this.onLoadMoreData()
      })
  }

  onLoadMoreData = () => {
    this.props.firebase
      .message(this.state.chatPath)
      .child('messages')
      .orderByChild('createdAt')
      .endAt(
        this.state.messagesList[this.state.messagesList.length - 1].createdAt
      )
      .limitToLast(this.props.limit)
      .once('value', async snapshot => {
        const chatObjectList = await snapshot.val()
        const chatArrayList = Object.keys(chatObjectList)
        let oldMessagesList = await chatArrayList.map(key => ({
          ...chatObjectList[key],
          key
        }))
        oldMessagesList.pop()
        if (oldMessagesList.length > 0) {
          this.setState(
            {
              isLoading: false
            },
            () => {
              this.props.onLoadMessages(oldMessagesList, this.state.chatPath)
            }
          )
        } else {
          this.setState({ isLoading: false, isFetchMessage: false })
        }
      })
  }

  render() {
    const {
      authUser,
      history,
      state: { cid, contactName }
    } = this.props
    const { usersIDs, text, error, messagesList, isLoading } = this.state

    return (
      <View style={styles.container}>
        <Header title={contactName} history={history} />
        {/* ACTIVITY INDICATOR ON LOADING */}
        {isLoading && (
          <ActivityIndicator style={styles.spinner} size="large" color="#222" />
        )}

        {/* DISPLAY MESSAGES */}
        <DisplayMessages
          authUser={authUser}
          usersIDs={usersIDs}
          extraData={messagesList}
          messagesList={messagesList}
          viewabilityConfig={this.viewabilityConfig}
          onViewableItemsChanged={this.onViewableItemsChanged}
          inverted
        />

        {/* INPUT FIELD */}
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.footer}>
            <TextInput
              value={text}
              style={styles.input}
              multiline
              textAlignVertical="top"
              underlineColorAndroid="transparent"
              placeholder="Type text"
              placeholderTextColor="#61dafb"
              onChangeText={text => this.setState({ text })}
              onSubmitEditing={this.onSendMessage}
            />

            {/* SEND BUTTON */}
            <TouchableOpacity onPress={this.onSendMessage}>
              <Entypo name="paper-plane" {...iconStyle} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* DISPLAY ERROR */}
        {error && <Text>{error.message}</Text>}
      </View>
    )
  }
}

export default withAuthorization(ChatScreen)

ChatScreen.propTypes = {
  state: PropTypes.shape({
    cid: PropTypes.string.isRequired,
    contactName: PropTypes.string.isRequired,
    path: PropTypes.string
  })
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  spinner: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0
  },
  rowText: {
    flex: 1
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#222',
    padding: 20
  },
  input: {
    color: '#61dafb',
    paddingHorizontal: 20,
    fontSize: 18,
    flex: 1
  }
})
