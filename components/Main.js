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
      isVisible: false,
      cacheScreen: null,
      cacheData: null
    }
  }

  static getDerivedStateFromProps(props, state) {
    const {
      history,
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
    const contactsListRef = firebase.user(authUser.uid).child('contactsList')
    const chatsListRef = firebase.user(authUser.uid).child('chatList')

    // Listen changes in contacts list
    this.onListenContactChanges(contactsListRef)
  }

  onListenContactChanges = ref => {
    ref.on('value', snapshot => {
      contactsObjectList = snapshot.val()
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
              (contactsList.sort((objOne, objTwo) => objOne.name - objTwo.name),
              // Then send list to Redux
              this.props.onSetContacts(contactsList))
          })
      })
    })
  }

  render() {
    const { isVisible, cacheScreen, cacheData } = this.state
    const Screen = cacheScreen
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
