// USE THIS HOC TO WRAP THE TOP COMPONENT (APP.JS)
// SO THAT AUTH STATE PROVIDED ONCE AND ANY COMPONENT
// WHICH IS CHILD OF TOP COMPONENT (APP.JS) CAN CONSUME
// THE AUTH STATE VIA withAuthorization HOC
// TODO: CHECK PROPTYPES FOR EVERY COMPONENT
// TODO: Set password change & reset
// TODO: Create loading screen

import React from 'react'
import { View } from 'react-native'
import { withRouter } from 'react-router-native'

// React.createContext
import { AuthUserContext } from './index'

// FIREBASE HOC
import { withFirebase } from '../Firebase'
import withNotification from '../HOCs/withNotification'
import withLoader from '../HOCs/withLoader'
import { compose } from 'recompose'

const checker = (arr, obj) =>
  arr.length >= Object.keys(obj).length ? true : false

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props)
      // If there is no auth user in the local storage,
      // the local state will stay null until
      // componentDidMount checks for the auth user.
      this.state = {
        authUser: null,
        isMergedContactsListLoaded: false,
        isMessagesListLoaded: false
      }
    }

    componentDidMount() {
      console.log('withAuthentication mounted')
      const { firebase, onLoader } = this.props
      this.props.isLoadComplete || onLoader({ isLoadComplete: false })

      // Listen for changes in firebase for
      // authentication status of the current authUser
      this.listener = firebase.onAuthUserListener(
        async authUser => {
          // If the authUser exist, save it in state
          await this.setState({ authUser })
          // Then start to listen for changes
          this.onListenChanges()
        },
        () => {
          // If there is no authUser, keep it null
          // so that private screens are protected
          // along this is null
          this.setState({ authUser: null })
          onLoader({ isLoadComplete: true })
        }
      )
    }

    componentWillUnmount() {
      console.log('withAuthentication unmounted')
      this.listener()
    }

    onListenChanges = () => {
      const { firebase } = this.props
      const { authUser } = this.state

      // References to Firebase Realtime Database
      const contactsListRef = firebase.user(authUser.uid).child('contactsList')
      const chatsListRef = firebase.user(authUser.uid).child('chatList')

      // Listen changes in contacts list
      this.onListenContactChanges(contactsListRef)

      // Listen changes in chats list
      this.onListenChatChanges(chatsListRef)
    }

    onListenContactChanges = ref => {
      const {
        isMergedContactsListLoaded,
        authUser: { contactsList, mergedContactsList }
      } = this.state
      let contactsCount = Object.keys(contactsList).length

      // If authUser has no any contacts to display...
      contactsCount ||
        // Update the text of loading screen
        this.props.onLoader({ isContactsLoadComplete: true })

      ref.on('child_added', async snapshot => {
        let contactObject = await snapshot.val()

        // Merge key of snapshot to contactObject
        // Key will be needed as reference on removing
        contactObject.key = snapshot.key

        await this.setState(state => {
          state.authUser.mergedContactsList.push(contactObject)

          return { authUser: state.authUser }
        })

        isMergedContactsListLoaded ||
          (mergedContactsList.length === contactsCount &&
            this.setState({ isMergedContactsListLoaded: true }, () =>
              this.props.onLoader({ isContactsLoadComplete: true })
            ))

        this.onListenForUserInfoChanged(contactObject.cid, 'name')
        this.onListenForUserInfoChanged(contactObject.cid, 'email')
      })

      ref.on('child_removed', async snapshot => {
        let contactObject = await snapshot.val()
        this.setState(state => {
          state.authUser.mergedContactsList = state.authUser.mergedContactsList.filter(
            contact => contact.cid !== contactObject.cid
          )

          return { authUser: state.authUser }
        })
      })
    }

    onListenForUserInfoChanged = (cid, property) => {
      const { firebase } = this.props

      firebase
        .user(cid)
        .child(property)
        .on('value', snapshot => {
          let value = snapshot.val()

          this.setState(state => {
            let contactObject = state.authUser.mergedContactsList.find(
              contact => contact.cid === cid
            )
            contactObject[property] = value

            if (state.authUser.messagesList.length > 0) {
              let chatObject = state.authUser.messagesList.find(
                chatObject => chatObject.contactId === cid
              )
              if (chatObject) chatObject[property] = value
              return { authUser: state.authUser }
            }
            return { authUser: state.authUser }
          })
        })
    }

    onListenChatChanges = ref => {
      const { firebase } = this.props
      const {
        isMessagesListLoaded,
        authUser,
        authUser: { chatList, messagesList }
      } = this.state

      // If authUser has no any chats to display...
      Object.keys(chatList).length ||
        // Update the text of loading screen
        this.props.onLoader({ isChatsLoadComplete: true })

      ref.on('child_added', async snapshot => {
        let chatObject = await snapshot.val()
        // Will be index of chatObject in messages list array
        let index
        // New texts are going to be pushed into this array
        chatObject.messages = []

        // Look for user of the chatObject in authUser's merged contacts list
        const isUserExistInContactsList = await authUser.mergedContactsList.find(
          contact => contact.cid === chatObject.contactId
        )

        // If the user exist...
        if (isUserExistInContactsList && isUserExistInContactsList.name) {
          // Then get its username and merge to the chatObject
          chatObject.contactName = isUserExistInContactsList.name
        } else {
          // If not, fetch user's email address to display so that authUser will know that this user is not in its contact list
          const user = await firebase
            .user(chatObject.contactId)
            .child('email')
            .once('value')

          // Merge email to the chatObject
          chatObject.userEmail = await user.val()
        }

        // chatObject is ready sending to state
        await this.setState(state => {
          // keep index of pushed chatObject
          index = state.authUser.messagesList.push(chatObject) - 1
          return { authUser: state.authUser }
        })

        isMessagesListLoaded ||
          (checker(messagesList, chatList) &&
            this.setState({ isMessagesListLoaded: true }, () =>
              this.props.onLoader({ isChatsLoadComplete: true })
            ))

        // Start to listen for changes of this chatObject
        await this.onListenNewMessage(chatObject, index)
      })
    }

    onListenNewMessage = (chatObject, index) => {
      const { firebase, sendNotification } = this.props
      const { authUser } = this.state

      const ref = firebase.message(chatObject.path)

      let senderName
      let initLength

      ref
        .child('messages')
        .orderByChild('createdAt')
        .on('child_added', async snapshot => {
          let messageObj = await snapshot.val()
          messageObj.key = snapshot.key
          messageObj.ref = snapshot.ref

          await this.setState(
            state => {
              initLength = state.authUser.messagesList[index].messages.unshift(
                messageObj
              )
              return { authUser: state.authUser }
            },
            () => {
              messageObj.userId === authUser.uid &&
                this.onListenReadChanges(ref, messageObj, initLength, index)
            }
          )

          messageObj.isRead === 'true' ||
            messageObj.userId === authUser.uid ||
            ((senderName = await authUser.mergedContactsList.find(
              contact => contact.cid === messageObj.userId
            )),
            sendNotification({
              senderName:
                (senderName && senderName.contactName) || chatObject.userEmail,
              contactId: messageObj.userId,
              chatPath: chatObject.path,
              text: messageObj.text
            }))
        })
    }

    onListenReadChanges = (ref, message, initLength, index) => {
      ref
        .child(`messages/${message.key}/isRead`)
        .on('value', (snapshot, key) => {
          let messageObjectIsRead = snapshot.val()

          this.setState(state => {
            const currentLength =
              state.authUser.messagesList[index].messages.length

            const indexOfUpdateMessageObject = currentLength - initLength

            state.authUser.messagesList[index].messages[
              indexOfUpdateMessageObject
            ].isRead = messageObjectIsRead
            return { authUser: state.authUser }
          })
        })
    }

    render() {
      return (
        <AuthUserContext.Provider
          value={{
            authUser: this.state.authUser,
            onLoader: this.props.onLoader,
            isChatsLoadComplete: this.props.isChatsLoadComplete,
            isLoadComplete: this.props.isLoadComplete
          }}>
          <View style={{ flex: 1, backgroundColor: 'red' }}>
            <Component {...this.props} />
          </View>
        </AuthUserContext.Provider>
      )
    }
  }

  return compose(
    withLoader,
    withFirebase,
    withRouter,
    withNotification
  )(WithAuthentication)
}

export default withAuthentication
