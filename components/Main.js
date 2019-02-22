import React, { Component } from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'
import { withAuthorization } from './Session'
import * as ROUTES from './constants'
import Home from './Home'
import { ChatScreen } from './Home/ChatsScreen'
import { ContactScreen, AddNewContactScreen } from './Home/ContactsScreen'
import PasswordChange from './Home/Account/PasswordChange'
import { TransLeft } from './Animations'

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

const { width } = Dimensions.get('window')

class Main extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isContactsLoaded: false,
      isMessagesLoaded: false,
      isVisible: false,
      cacheScreen: null,
      cacheData: null
    }
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

    // References to Firebase Realtime Database
    this.contactsListRef = firebase.user(authUser.uid).child('contactsList')
    this.chatsListRef = firebase.user(authUser.uid).child('chatList')

    // Listen changes in contacts list
    this.onListenContactChanges(this.contactsListRef)
    this.onListenChatChanges(this.chatsListRef)
  }

  onListenContactChanges = ref => {
    ref.on('value', snapshot => {
      const contactsObjectList = snapshot.val()
      console.log('contactsObjectList ,', contactsObjectList)

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
                this.props.onSetContacts(contactsList))
            })
        })
      } else if (contactsObjectList || this.props.contacts) {
        this.props.onSetContacts(null)
      }
    })
  }

  onListenChatChanges = ref => {
    ref.on('value', snapshot => {
      const messagesObjectList = snapshot.val()

      if (messagesObjectList) {
        const messagesArrayList = Object.keys(messagesObjectList)

        let length = messagesArrayList.length
        // let messagesList = []

        messagesArrayList.map(key => {
          let message = messagesObjectList[key]

          // message.messagesList = []
          this.props.firebase
            .message(message.path)
            .child('messages')
            .orderByChild('createdAt')
            .limitToLast(this.props.limit)
            .on('value', async snapshot => {
              const chatObjectList = await snapshot.val()
              const chatArrayList = Object.keys(chatObjectList)

              message.messagesList = chatArrayList
                .map(key => ({
                  ...chatObjectList[key],
                  key
                }))
                .reverse()

              // messagesList = message
              length && length--
              this.props.onSetMessages(message)
              // length || this.props.onSetMessages(message)
            })
        })
      } else if (messagesObjectList || this.props.messages) {
        this.props.onSetMessages(null)
      }
    })
  }

  componentWillUnmount = () => {
    this.contactsListRef.off()
    this.chatsListRef.off()
  }

  render() {
    const { isVisible, cacheScreen, cacheData } = this.state
    const Screen = cacheScreen

    console.log('history from main ,', this.props.history)
    return (
      <View style={styles.container}>
        <TransLeft
          width={width / 6}
          reverse={-1}
          duration={500}
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

export default withAuthorization(Main)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
})
