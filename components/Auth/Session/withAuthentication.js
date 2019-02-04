// USE THIS HOC TO WRAP THE TOP COMPONENT (APP.JS)
// SO THAT AUTH STATE PROVIDED ONCE AND ANY COMPONENT
// WHICH IS CHILD OF TOP COMPONENT (APP.JS) CAN CONSUME
// THE AUTH STATE VIA withAuthorization HOC
// TODO: Set functionality for creating new chat at chatscreen
// TODO: listen for contacts name
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

      let mergedContactsList = [];
      // Use this array to contain chatObjects after every
      // iterion of fetched datas from firebase
      let mergedMessagesList = [];

      // Listen for changes in firebase
      this.listener = firebase.onAuthUserListener(
        async authUser => {
          await this.setState(
            state => ({authUser, isLoading: false}),
          );

          this.onListenChanges();

          // this.setState(
          //   state => ({ authUser: authUser, isLoading: false, }),
          //   // () => {
          //   //   this.onListenChanges(authUser)
          //   // }
          // );
          // If user has contacts list...
          // if (authUser.contactsList) {
          //   Object.values(authUser.contactsList).map(contactObj => {
          //     // The original contactObj is immutable,
          //     // to able to work on this object
          //     // merge it into a new object called mergedChatObj
          //     let mergedContactObj = {...contactObj};
          //
          //     // Fetch merged contact object's username via
          //     // its own ID in users database
          //     firebase
          //       .user(mergedContactObj.cid)
          //       .child('name')
          //       .on('value', snapshot => {
          //         mergedContactObj.name = snapshot;
          //
          //         mergedContactsList = [
          //           mergedContactObj,
          //           ...mergedContactsList.filter(obj => obj.cid !== mergedContactObj.cid)
          //         ];
          //
          //         this.setState(state => {
          //           // Merge authUser with additional infos
          //           let mergedAuthUser = {
          //             ...state.authUser,
          //             ...authUser,
          //             mergedContactsList
          //           };
          //
          //           return ({
          //             authUser: mergedAuthUser,
          //           })
          //         })
          //       });
          //   });
          // };


          // If user has chat conversion records...
          // if (authUser.chatList) {
          //   // Iterate on the list to get every chat record objects
          //   Object.values(authUser.chatList).map(async chatObj => {
          //     // The original chatObj is immutable,
          //     // to able to work on this object
          //     // merge it into a new object called mergedChatObj
          //     let mergedChatObj = {...chatObj};
          //
          //     const contactName = await firebase.user(mergedChatObj.contactId).child('name').once('value');
          //
          //
          //     // Fetch merged chat record object's history via
          //     // its own path in messages database
          //     firebase
          //       .message(mergedChatObj.path)
          //       .child('messages')
          //       .orderByChild('createdAt')
          //       .limitToLast(10)
          //       .on('value', snapshot => {
          //         // The list of every message objects
          //         const messagesList = Object.values(snapshot.val());
          //         // console.log("messagesList ,", messagesList);
          //
          //         // Merge every message objects with additional info
          //         // for later use in children components
          //         const messagesObj = {
          //           contactName: contactName.val(),
          //           cid: mergedChatObj.contactId,
          //           path: mergedChatObj.path,
          //           messages: messagesList,
          //         };
          //
          //         // Always merge new message obj on messagesList
          //         // to avoid duplicate of prev and next message obj
          //         mergedMessagesList = [
          //           messagesObj,
          //           ...mergedMessagesList.filter(obj => obj.cid !== messagesObj.cid)
          //         ];
          //
          //         this.setState(state => {
          //           // Merge authUser with additional infos
          //           let mergedAuthUser = {
          //             ...state.authUser,
          //             ...authUser,
          //             messagesList: mergedMessagesList,
          //           };
          //
          //           return ({
          //             authUser: mergedAuthUser,
          //           })
          //         })
          //       });
          //   });
          // } else {
          //   this.setState({authUser});
          // }
        },
        () => {
          this.setState({ authUser: null });
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

      // Listen for changes in authUser's chatList
      firebase
        .user(authUser.uid)
        .child('chatList')
        .on('value', async snapshot => {
          const chatsObject = snapshot.val();

          // Update the state with changes
          await this.setState(state => {
            state.authUser.chatList = {
              ...state.authUser.chatList,
              ...chatsObject
            };

            return ({authUser: state.authUser});
          });

          // Convert chats Object to a list of array
          const chatsObjectList = Object.values(chatsObject);

          // After updated the state,
          // Start to listen changes for every
          // chatObj of authUser's chatList.
          chatsObjectList.map(chatObj => {
            firebase
              .message(chatObj.path)
              .child('messages')
              .orderByChild('createdAt')
              .limitToLast(1)
              .on('child_added', snapshot => {
                const messageObj = snapshot.val();

                // Get the messagesList to compare if
                // this fetched messageObj is a new message
                // or an old one.
                const messagesList = authUser.messagesList.find(obj => obj.path === chatObj.path);
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
                  state.authUser
                    .messagesList[messagesListIndex]
                    .messages
                    .unshift(messageObj);

                  return ({authUser: state.authUser});
                });
              });
          });
        })
    }

    render() {
      // console.log("withAuthentication state ,",this.state);
      if (this.state.isLoading) return <Text>Loading...</Text>;

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
