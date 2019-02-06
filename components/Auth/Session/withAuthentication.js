// USE THIS HOC TO WRAP THE TOP COMPONENT (APP.JS)
// SO THAT AUTH STATE PROVIDED ONCE AND ANY COMPONENT
// WHICH IS CHILD OF TOP COMPONENT (APP.JS) CAN CONSUME
// THE AUTH STATE VIA withAuthorization HOC
// TODO: set functionality for notifications again
// TODO: CHECK PROPTYPES FOR EVERY COMPONENT

import React from 'react';
import { Text } from 'react-native';
import { withNavigationFocus } from 'react-navigation';

// React.createContext
import { AuthUserContext } from './index';

// FIREBASE HOC
import { withFirebase } from '../../Firebase';
import { compose } from 'recompose';

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);
      // If there is no auth user in the local storage,
      // the local state will stay null untill
      // componentDidMount checks for the auth user.
      this.state = {
        authUser: null,
        isLoading: false,
      };
    }

    componentDidMount() {
      console.log("withAuthentication mounted");
      const { firebase } = this.props;

      this.setState({ isLoading: true });

      // Listen for changes in firebase for
      // authentication status of the current authUser
      this.listener = firebase.onAuthUserListener(
        async authUser => {
          // If the authUser exist, save it in state
          await this.setState(
            state => ({authUser, isLoading: false}),
          );
          // Then start to listen for changes
          this.onListenChanges();
        },
        () => {
          // If there is no authUser, keep it null
          // so that private screens are protected
          // along this is null
          this.setState({ authUser: null, isLoading: false});
        }
      );
    }

    componentWillUnmount() {
      console.log("withAuthentication unmounted");
      this.listener();
    }

    onListenChanges = () => {
      const { firebase } = this.props;
      const { authUser } = this.state;

      // Listen for changes in authUser's contactsList
      firebase
        .user(authUser.uid)
        .child('contactsList')
        .on('value', async snapshot => {
          const contactsObjectsList = await snapshot.val();

          // Save updated raw objectList for later use
          await this.setState(state => {
            state.authUser.contactsList = {
              ...state.authUser.contactsList,
              ...contactsObjectsList,
            };

            return ({ authUser: state.authUser });
          });

        // After updated the state,
        // Convert raw objectlist to a list of array
        const contactsArrayList = Object.values(contactsObjectsList);

        // Start to listen changes for dynamic
        // datas like username for every
        // contactObj in authUser's contactsList.
        contactsArrayList.map(contactObj => {
          // The original contactObj is immutable,
          // to able to work on this object
          // merge it into a new object called mergedChatObj
          let mergedContactObj = {...contactObj};

          // Listen to database for changes of this contact person
          firebase
            .user(mergedContactObj.cid)
            .child('name')
            .on('value', async snapshot => {
              const contactCurrentUserName = await snapshot.val();
              // Merge current username of contact to exact
              // contact object in authUser's contact list
              mergedContactObj.name = await contactCurrentUserName;

              // First check if there is chat record in authUser's messageslist.
              // Update the username in authUser's messagesList
              // if exist.
              await authUser.messagesList.find((chatObj, i) => {
                let isRecord = chatObj.cid === mergedContactObj.cid;

                // If the chat record found...
                if (isRecord) {
                  // then update the contact's username so that
                  // ChatList, ChatScreen, ContactsList, ContactScreen
                  // components are can display the name
                  this.setState(state => {
                    state.authUser.messagesList[i].contactName = mergedContactObj.name;

                    return ({ authUser: state.authUser });
                  });
                }
              });

              // Second,  update the authUser's mergedContactsList
              // in state with username
              this.setState(state => {
                state.authUser.mergedContactsList = [
                  mergedContactObj,
                  ...state.authUser.mergedContactsList.filter(obj => obj.cid !== mergedContactObj.cid)
                ];

                return ({ authUser: state.authUser});
              });
            });
        })
      });

      // Listen for changes in authUser's chatList
      firebase
        .user(authUser.uid)
        .child('chatList')
        .on('value', async snapshot => {
          const chatsObject = snapshot.val();

          // Update the state with changes
          await this.setState(state => {
            state.authUser.chatList = {
              ...chatsObject
            };

            return ({authUser: state.authUser});
          });

          // After updated the state
          // Convert chats Object to a list of array
          // to iterate over it
          const chatsObjectList = Object.values(chatsObject);
          chatsObjectList.map(async chatObj => {

            // First make a search in authUser's messagesList
            // if this chatObj exist
            const isChatObjExistInMessagesList = authUser.messagesList.find(obj => obj.path === chatObj.path);

            // If this chatObj exist...
            if (isChatObjExistInMessagesList) {

              // Then start to listen for child_added everytime
              this.onListenNewMessage(chatObj);
            } else {
              // If this chatObj does not exist, which means
              // this is a new chat record
              // Get the contact's current username
              const contact = await authUser.mergedContactsList.find(obj => {
                const isContact = obj.cid === chatObj.contactId;

                if (isContact) return obj;
              });

              // Fetch the text for once, this is not a listen operation!
              const snapshot = await firebase
                .message(chatObj.path)
                .child('messages')
                .orderByChild('createdAt')
                .once('value');

              // Merge text into an array
              const initMessageText = await Object.values(snapshot.val());

              // Create init object for once,
              // when there is new messages, we will
              // update this object's messages property
              // in this.onListenNewMessage
              const messagesObj = {
                contactName: contact.name,
                cid: contact.cid,
                path: chatObj.path,
                messages: initMessageText,
              };

              // Save the object in state to let
              // ChatScreen component can render it via props
              await this.setState(state => {
                state.authUser.messagesList.push(messagesObj);

                return ({ authUser: state.authUser});
              });

              // Then start to listen for child_added everytime
              this.onListenNewMessage(chatObj);
            }
          });
        });
    }

    onListenNewMessage = chatObj => {
      const { firebase } = this.props;
      const { authUser } = this.state;

      firebase
        .message(chatObj.path)
        .child('messages')
        .orderByChild('createdAt')
        .limitToLast(1)
        .on('child_added', snapshot => {
          const messageObj = snapshot.val();
          console.log("child_added ,", messageObj);

          // Get the messagesList to compare if
          // this fetched messageObj is a new message
          // or an old one.
          const messagesList = authUser.messagesList.find(obj => {
            let isMessageObj = obj.path === chatObj.path;

            if (isMessageObj) return obj;
          });

          const messagesListIndex = authUser.messagesList.indexOf(messagesList);
          // The latest message of messagesList
          // First element of the array is the
          // latest message because the fetched data
          // once reversed
          const lastMessageObj = messagesList.messages[0];

          // If this fetched messageObj is a new message...
          JSON.stringify(messageObj) === JSON.stringify(lastMessageObj) ||
          // Then update the state with new messageObject
          this.setState(state => {
            state.authUser.messagesList[messagesListIndex]
              .messages
              .unshift(messageObj);

            return ({authUser: state.authUser});
          });
        });
    }

    render() {
      if (this.state.isLoading) return <Text>Loading...</Text>;
      // this.state.authUser &&
      // console.log("authuser from withAuthentication ,", this.state.authUser.messagesList);

      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return compose(
    withFirebase
  )(WithAuthentication);
};

export default withAuthentication;
