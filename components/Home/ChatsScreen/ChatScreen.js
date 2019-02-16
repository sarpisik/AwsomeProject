import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native'
import { Entypo } from '@expo/vector-icons'

import { withAuthorization } from '../../Session'
import Header from '../../HOCs/withHeader'
import List from '../../List'

const SCREEN_WIDTH = Dimensions.get('window').width

const iconStyle = {
  color: '#61dafb',
  size: 25
}

const ShowMessages = ({ messagesList, renderItem, extraData }) => {
  return (
    <FlatList
      data={messagesList}
      extraData={extraData}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      inverted
    />
  )
}

ShowMessages.propTypes = {
  messagesList: PropTypes.array,
  renderItem: PropTypes.func.isRequired
}

class ChatScreen extends Component {
  constructor(props) {
    super(props)

    const {
      authUser,
      location: {
        state: { contactName, cid, path }
      }
    } = props

    this.state = {
      text: '',
      messagesList: [],
      usersIDs: {
        [cid]: contactName,
        [authUser.uid]: authUser.name
      },
      chatPath: path || '',
      error: null
    }

    this.anim = new Animated.Value(0)
  }

  componentDidMount = () => {
    Animated.timing(this.anim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start()
    console.log('this.anim ,', this.anim)
  }

  componentWillUnmount = async () => {
    console.log('this.anim ,', this.anim)
    await this.anim.setValue(1)
    console.log('this.anim ,', this.anim)
    await Animated.timing(this.anim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true
    }).start()
    console.log('this.anim ,', this.anim)
  }

  static getDerivedStateFromProps(props, state) {
    const {
      authUser,
      location: {
        state: { cid }
      }
    } = props
    const isChatList = authUser.messagesList.find(obj => obj.contactId === cid)
    const messagesList = (isChatList && isChatList.messages) || []

    if (messagesList !== state.messagesList) {
      return {
        messagesList: messagesList
      }
    }
    return null
  }

  // Display messages in ShowMessages component
  renderItem = ({ item }) => {
    const { authUser } = this.props
    const { usersIDs } = this.state

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

  // On press Send button or submit input
  onSendMessage = async () => {
    const {
      firebase,
      authUser,
      location: {
        state: { cid, path }
      }
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
      await this.createChatObjectForUser(authUser.uid, cid, newChatPath.key)
      // Then save the path into contact's database
      await this.createChatObjectForUser(cid, authUser.uid, newChatPath.key)

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

  createChatObjectForUser = (userId, contactId, path) => {
    const { firebase } = this.props

    // Prepare the object which will send to
    // user's specified database
    const newChatObjectRecord = {
      contactId: contactId,
      path: path
    }

    // Then connect to userId's database
    const currentUser = firebase.user(userId).child('chatList')

    // and save the new object in messages record array
    currentUser.push(newChatObjectRecord)
  }

  handleReadMessage = cid => {
    const { firebase } = this.props
    const { chatPath, messagesList } = this.state

    const contactUserMessages = messagesList.filter(
      messageObject =>
        messageObject.userId === cid && messageObject.isRead === 'false'
    )
    contactUserMessages.forEach(messageObject => {
      firebase
        .message(chatPath)
        .child(`messages/${messageObject.key}/isRead`)
        .set('true')
    })
  }

  render() {
    const {
      history,
      location: {
        state: { cid, contactName }
      }
    } = this.props
    const { text, error, messagesList } = this.state
    const opacityScale = this.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    })
    const translateScale = this.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-SCREEN_WIDTH, 0]
    })
    let transformStyle = {
      ...styles.container,
      opacity: opacityScale,
      transform: [{ translateX: translateScale }]
    }
    this.handleReadMessage(cid)
    return (
      <Animated.View style={transformStyle}>
        <Header title={contactName} history={history} />
        {/* DISPLAY MESSAGES */}
        <ShowMessages
          renderItem={this.renderItem}
          extraData={this.state}
          messagesList={messagesList}
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
      </Animated.View>
    )
  }
}

export default withAuthorization(ChatScreen)

ChatScreen.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      cid: PropTypes.string.isRequired,
      contactName: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  })
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  rowText: {
    flex: 1
  },
  text: {
    fontStyle: 'normal'
  },
  read: { color: 'navy' },
  unRead: { color: 'red' },
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
