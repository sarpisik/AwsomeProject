import React, { Component } from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'
import { withAuthorization } from './Session'
import withNotification from './HOCs/withNotification'
import * as ROUTES from './constants'
import Loading from './Loading'
import Home from './Home'
import { ChatScreen } from './Home/ChatsScreen'
import { ContactScreen, AddNewContactScreen } from './Home/ContactsScreen'
import PasswordChange from './Home/Account/PasswordChange'
import { TransLeft } from './Animations'
import { compose } from 'recompose'

const subScreens = {
  [`${ROUTES.MAIN}${ROUTES.CHAT_SCREEN}`]: {
    component: ChatScreen
  },
  [`${ROUTES.MAIN}${ROUTES.CONTACT_SCREEN}`]: {
    component: ContactScreen
  },
  [`${ROUTES.MAIN}${ROUTES.ADD_NEW_CONTACT_SCREEN}`]: {
    component: AddNewContactScreen
  },
  [`${ROUTES.MAIN}${ROUTES.PASSWORD_CHANGE}`]: {
    component: PasswordChange
  }
}

const INITIAL_STATE = {
  isLoading: false,
  isContactsLoaded: false,
  isChatsLoadedEmpty: false,
  isVisible: false,
  cacheScreen: null,
  cacheData: null
}

const { width } = Dimensions.get('window')

class Main extends Component {
  constructor(props) {
    super(props)

    this.state = INITIAL_STATE
  }

  static getDerivedStateFromProps(props, state) {
    const {
      location,
      location: { pathname }
    } = props

    if (subScreens[pathname])
      return {
        cacheScreen: subScreens[pathname].component,
        cacheData: location.state,
        isVisible: true
      }
    if (state.cacheScreen)
      return {
        isVisible: false
      }

    return null
  }

  componentDidMount = () => {
    const { firebase, authUser } = this.props
    console.log('MAIN MOUNTED ,', this.state)

    this.setState({ isLoading: true })

    // References to Firebase Real time Database
    this.contactsListRef = firebase.user(authUser.uid).child('contactsList')
    this.chatsListRef = firebase.user(authUser.uid).child('chatList')

    // Listen changes for contacts & chats lists
    this.onListenContactChanges(this.contactsListRef)
    this.onListenChatChanges(this.chatsListRef)
  }

  componentDidUpdate = () => {
    const { isLoading, isContactsLoaded, isChatsLoadedEmpty } = this.state
    const { authUser, messages } = this.props

    if (isLoading) {
      isContactsLoaded &&
        isChatsLoadedEmpty &&
        this.setState({ isLoading: false })
      isContactsLoaded &&
        messages &&
        messages.length === Object.keys(authUser.chatList).length &&
        this.setState({ isLoading: false })
    }
  }

  componentWillUnmount = () => {
    this.contactsListRef.off()
    this.chatsListRef.off()
    console.log('MAIN UN MOUNTED ,', this.state)
  }

  onListenContactChanges = ref => {
    ref.on('value', snapshot => {
      const contactsObjectList = snapshot.val()

      if (contactsObjectList) {
        const contactsArrayList = Object.keys(contactsObjectList)
        let length = contactsArrayList.length
        let contactsList = []
        contactsArrayList.map(key => {
          let contact = contactsObjectList[key]
          contact.key = key
          this.props.firebase
            .user(contact.cid)
            .child('name')
            .on('value', async snapshot => {
              contact.name = await snapshot.val()

              contactsList = await [...contactsList, contact]

              length && length--
              // If this is the last contact in the list...
              length ||
                // Sort list by name
                (contactsList.sort(
                  (objOne, objTwo) => objOne.name - objTwo.name
                ),
                // Then send list to Redux
                this.props.onSetContacts(contactsList),
                this.state.isContactsLoaded ||
                  this.setState({ isContactsLoaded: true }))
            })
        })
      } else if (contactsObjectList || this.props.contacts) {
        this.props.onSetContacts(null)
      } else {
        this.setState({ isContactsLoaded: true })
      }
    })
  }

  onListenChatChanges = ref => {
    ref.on('value', snapshot => {
      const messagesObjectList = snapshot.val()

      // If authUser has chat records...
      if (messagesObjectList) {
        const messagesArrayList = Object.keys(messagesObjectList)

        messagesArrayList.map(async (key, index) => {
          let message = messagesObjectList[key]

          // First fetch old messages by limit count
          const snapshot = await this.props.firebase
            .message(message.path)
            .child('messages')
            .orderByChild('createdAt')
            .limitToLast(this.props.limit)
            .once('value')
          const value = await snapshot.val()
          // Initial messages count
          const messagesCountToListen = await Object.keys(value).length
          // let count = messagesCountToListen
          message.index = index
          message.messagesList = []

          await this.props.onSetChats(message)

          // Second, listen for new messages and also limit fetch count to old messages count for init listening
          const chatRef = this.props.firebase.message(message.path)
          chatRef
            .child('messages')
            .orderByChild('createdAt')
            .limitToLast(messagesCountToListen)
            .on('child_added', async snapshot => {
              let chatObject = await snapshot.val()
              chatObject.key = await snapshot.key
              chatObject.index = await index

              // Dispatch the new message
              await this.props.onSetMessages(chatObject, index)

              // If the message is unread and...
              if (chatObject.isRead === 'false') {
                // If the sender is authUser...
                if (chatObject.userId === this.props.authUser.uid) {
                  chatRef
                    .child(`messages/${chatObject.key}/isRead`)
                    .on('value', snapshot => {
                      // Listen until read
                      if (snapshot.val() === 'true') {
                        // Then stop listen
                        chatRef.child(`messages/${chatObject.key}/isRead`).off()
                        // Dispatch read value for UI feedback
                        this.props.onReadMessages(
                          chatObject.index,
                          chatObject.key,
                          snapshot.val()
                        )
                      }
                    })

                  // If the sender is contact user...
                } else {
                  // Get name if it exists in contacts list
                  const senderName =
                    (await this.props.contacts.find(
                      contact => contact.cid === chatObject.userId
                    ).name) ||
                    // If not get the email
                    message.contactEmail

                  // Throw notification of new message
                  this.props.sendNotification({
                    senderName: senderName,
                    contactId: chatObject.userId,
                    path: message.path,
                    text: chatObject.text
                  })
                }
              }
            })
        })

        // If authUser removed all chats...
      } else if (messagesObjectList || this.props.messages) {
        // Reset Redux
        this.props.onResetChats()

        // If no chats exist on initial runnig
      } else {
        // Trigger loading screen
        this.setState({ isChatsLoadedEmpty: true })
      }
    })
  }

  render() {
    const { isLoading, isVisible, cacheScreen, cacheData } = this.state
    const Screen = cacheScreen

    return isLoading ? (
      <Loading />
    ) : (
      <View style={styles.container}>
        <TransLeft
          width={width / 6}
          reverse={-1}
          duration={350}
          visible={!isVisible}>
          <Home />
        </TransLeft>
        <TransLeft duration={350} visible={isVisible}>
          {cacheScreen && <Screen state={cacheData} />}
        </TransLeft>
      </View>
    )
  }
}

export default compose(
  withAuthorization,
  withNotification
)(Main)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
})
