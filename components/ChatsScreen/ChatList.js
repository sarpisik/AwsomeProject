import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image
} from 'react-native';

import { compose } from 'recompose';
import { withNavigationFocus } from 'react-navigation';
import withNotification from '../withNotification';

// CHAT LIST
class ChatList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chatList: [],
      // authUser: props.authUser,
      isLoading: false,
    };
  }

  // onListenData = () => {
  //   const { firebase, sendNotification } = this.props;
  //   const { authUser } = this.state;
  //
  //   this.setState({isLoading: true})
  //
  //   // If the user has chat records already
  //   if (authUser.chatList) {
  //     Object.keys(authUser.chatList).map(chatObjectKey => {
  //
  //       // A chat object in the authUser's chatlist object
  //       let chatObjectValue = {...authUser.chatList[chatObjectKey]};
  //
  //       // Fetch the contact name via its ID
  //       // from that chat record object
  //       firebase
  //         .user(chatObjectValue.contactId)
  //         .on('value', snapshot => {
  //           const contactObject = snapshot.val();
  //
  //           // Contact name
  //           const contactName = contactObject.name;
  //           // Merge contact name to the chat object
  //           chatObjectValue.contactName = contactName;
  //
  //           // Then connect to messages database via path
  //           firebase
  //             .message(chatObjectValue.path)
  //             .child('messages')
  //             .orderByChild('createdAt')
  //             .limitToLast(1)
  //             .on('child_added', snapshot => {
  //               // const messageObject = Object.values(snapshot.val())[0];
  //               // console.log("snapshot from chatlist ,", snapshot);
  //
  //               const messageObject = snapshot.val();
  //
  //               // Merge last text to the chat object
  //               chatObjectValue.lastMessage = messageObject.text;
  //
  //               this.setState(state => {
  //
  //                 // Look for existing chat obj
  //                 const oldChatObj = state.chatList.find(chat => chat.path === chatObjectValue.path);
  //
  //                 // If old chat obj is not undefined
  //                 if (oldChatObj) {
  //                   let newChatObj = chatObjectValue;
  //
  //                   // Create new chatList which doesnt include oldChatObj
  //                   let newChatList = state.chatList.filter(chatObj => chatObj !== oldChatObj);
  //
  //                   // And push new chatobj into it
  //                   newChatList.push(newChatObj);
  //
  //                   // If the sender of message is not the authUser
  //                   messageObject.userId === authUser.uid &&
  //                   // Then Send notification of new message
  //                   sendNotification(
  //                     newChatObj.contactName,
  //                     newChatObj.lastMessage,
  //                     authUser,
  //                     chatObjectValue.contactId,
  //                     chatObjectValue.path,
  //                   );
  //
  //                   // Update state with new chatlist array to render the list
  //                   return ({chatList: newChatList});
  //                 } else {
  //
  //                   // update state directly with chatobj
  //                   // if there chatobj is undefined.
  //                   // which that means this is an initial loading the list
  //                   return ({
  //                     chatList: [
  //                       ...state.chatList,
  //                       chatObjectValue
  //                     ],
  //                     isMounted: true,
  //                     isLoading: false,
  //                   })
  //                 }
  //               })
  //             })
  //         });
  //       }
  //     );
  //   }
  // }
  //
  // onUpdateListen = () => {
  //   const { firebase, sendNotification } = this.props;
  //
  //   this.state.chatList.map(chatObj => {
  //     firebase
  //       .message(chatObj.path)
  //       .child('messages')
  //       .orderByChild('createdAt')
  //       .limitToLast(1)
  //       .once('value')
  //       .then(snapshot => {
  //         const cloudObj = Object.values(snapshot.val())[0];
  //         console.log("snapshot from update ,",cloudObj);
  //         if (cloudObj.text && chatObj.lastMessage !== cloudObj.text) {
  //           console.log("snapshot.text from update ,",cloudObj.text);
  //           let newChatObj = {...chatObj};
  //           newChatObj.lastMessage = cloudObj.text;
  //
  //           let newChatList = this.state.chatList.filter(obj => obj.path !== chatObj.path);
  //           newChatList.push(newChatObj);
  //
  //           console.log("newChatList ,",newChatList);
  //
  //           this.setState({
  //             chatList: newChatList,
  //           });
  //         }
  //         // console.log("snapshot from onUpdateListen ,",snapshot);
  //       })
  //   });
  // }
  //
  // offListenData = () => {
  //   const { firebase } = this.props;
  //
  //   firebase
  //     .user(this.state.authUser.uid)
  //     .child('chatList')
  //     .off();
  // }
  //
  // componentDidMount() {
  //   const { firebase, sendNotification } = this.props;
  //   const { authUser } = this.state;
  //
  //   this.onListenData();
  // }
  //
  // componentWillUnmount() {
  //   console.log("ChatList unmounted");
  //   this.offListenData();
  // }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.state.authUser !== this.props.authUser) {
  //     return true
  //   }
  //   return false
  // // }

  render() {
    const { onNavigate, isFocused, authUser } = this.props;
    console.log("AUTHUSER FROM CHATLIST, ",authUser);

    if (isFocused) {
      // this.state.isMounted && this.onUpdateListen();
      console.log("ChatList isFocused");
    } else {

      console.log("ChatList notFocused");
    }

    if (this.state.isLoading) return <Text>Loading...</Text>

    return (
      <View>
        <FlatList
          data={authUser.messagesList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => onNavigate(this.props.authUser, item)}>
              <View>
                <Text>
                  {item.cid}
                </Text>
                <Text>
                  {item.messages[item.messages.length-1].text}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
}

export default compose(
  withNotification,
  withNavigationFocus
)(ChatList);
