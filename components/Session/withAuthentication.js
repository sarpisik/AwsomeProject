// USE THIS HOC TO WRAP THE TOP COMPONENT (APP.JS)
// SO THAT AUTH STATE PROVIDED ONCE AND ANY COMPONENT
// WHICH IS CHILD OF TOP COMPONENT (APP.JS) CAN CONSUME
// THE AUTH STATE VIA withAuthorization HOC
// TODO: CHECK PROPTYPES FOR EVERY COMPONENT
// TODO: Set route goback for home screen
// FIXME: Delayed fetch of username & email makes bug

import React from "react";
import { Text } from "react-native";
import { withRouter } from "react-router-native";

// React.createContext
import { AuthUserContext } from "./index";

// FIREBASE HOC
import { withFirebase } from "../Firebase";
import withNotification from "../HOCs/withNotification";
import { compose } from "recompose";

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);
      // If there is no auth user in the local storage,
      // the local state will stay null until
      // componentDidMount checks for the auth user.
      this.state = {
        authUser: null,
        isLoading: false
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
          await this.setState(state => ({ authUser, isLoading: false }));
          // Then start to listen for changes
          this.onListenChanges();
        },
        () => {
          // If there is no authUser, keep it null
          // so that private screens are protected
          // along this is null
          this.setState({ authUser: null, isLoading: false });
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

      // References to Firebase Realtime Database
      const contactsListRef = firebase.user(authUser.uid).child("contactsList");
      const chatsListRef = firebase.user(authUser.uid).child("chatList");

      // Listen changes in contacts list
      this.onListenContactChanges(contactsListRef);

      // Listen changes in chats list
      this.onListenChatChanges(chatsListRef);
    };

    onListenContactChanges = ref => {
      ref.on("child_added", async snapshot => {
        let contactObject = await snapshot.val();

        // Merge key of snapshot to contactObject
        // Key will be needed as reference on removing
        contactObject.key = snapshot.key;

        await this.setState(state => {
          state.authUser.mergedContactsList.push(contactObject);

          return { authUser: state.authUser };
        });

        this.onListenForUserInfoChanged(contactObject.cid, "name");
        this.onListenForUserInfoChanged(contactObject.cid, "email");
      });

      ref.on("child_removed", async snapshot => {
        let contactObject = await snapshot.val();
        this.setState(state => {
          state.authUser.mergedContactsList = state.authUser.mergedContactsList.filter(
            contact => contact.cid !== contactObject.cid
          );

          return { authUser: state.authUser };
        });
      });
    };

    onListenForUserInfoChanged = (cid, property) => {
      const { firebase } = this.props;

      firebase
        .user(cid)
        .child(property)
        .on("value", snapshot => {
          let value = snapshot.val();

          this.setState(state => {
            let contactObject = state.authUser.mergedContactsList.find(
              contact => contact.cid === cid
            );
            contactObject[property] = value;

            if (state.authUser.messagesList.length > 0) {
              let chatObject = state.authUser.messagesList.find(
                chatObject => chatObject.contactId === cid
              );
              if (chatObject) chatObject[property] = value;
              return { authUser: state.authUser };
            }
            return { authUser: state.authUser };
          });
        });
    };

    onListenChatChanges = ref => {
      const { firebase } = this.props;
      const { authUser } = this.state;

      ref.on("child_added", async snapshot => {
        let chatObject = await snapshot.val();
        // Will be index of chatObject in messages list array
        let index;
        // New texts are going to be pushed into this array
        chatObject.messages = [];

        // Look for user of the chatObject in authUser's merged contacts list
        const isUserExistInContactsList = await authUser.mergedContactsList.find(
          contact => contact.cid === chatObject.contactId
        );

        // If the user exist...
        if (isUserExistInContactsList) {
          // Then fetch its username and merge to the chatObject
          chatObject.contactName = isUserExistInContactsList.name;
        } else {
          // If not, fetch user's email address to display so that authUser will know that this user is not in its contact list
          const user = await firebase
            .user(chatObject.contactId)
            .child("email")
            .once("value");

          // Merge email to the chatObject
          chatObject.userEmail = await user.val();
        }

        // chatObject is ready to send state
        await this.setState(state => {
          // keep index of pushed chatObject
          index = state.authUser.messagesList.push(chatObject) - 1;
          return { authUser: state.authUser };
        });

        // Start to listen for changes of this chatObject
        await this.onListenNewMessage(chatObject, index);
      });
    };

    onListenNewMessage = (chatObject, index) => {
      const { firebase, sendNotification } = this.props;
      const { authUser } = this.state;

      const ref = firebase.message(chatObject.path);

      let senderName;
      let initLength;

      ref
        .child("messages")
        .orderByChild("createdAt")
        .on("child_added", async snapshot => {
          let messageObj = await snapshot.val();
          messageObj.key = snapshot.key;
          messageObj.ref = snapshot.ref;

          await this.setState(
            state => {
              initLength = state.authUser.messagesList[index].messages.unshift(
                messageObj
              );
              return { authUser: state.authUser };
            },
            () => {
              messageObj.userId === authUser.uid &&
                this.onListenReadChanges(ref, messageObj, initLength, index);
            }
          );

          messageObj.isRead === "true" ||
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
            }));
        });
    };

    onListenReadChanges = (ref, message, initLength, index) => {
      ref
        .child(`messages/${message.key}/isRead`)
        .on("value", (snapshot, key) => {
          let messageObjectIsRead = snapshot.val();

          this.setState(state => {
            const currentLength =
              state.authUser.messagesList[index].messages.length;

            const indexOfUpdateMessageObject = currentLength - initLength;

            state.authUser.messagesList[index].messages[
              indexOfUpdateMessageObject
            ].isRead = messageObjectIsRead;
            return { authUser: state.authUser };
          });
        });
    };
    render() {
      if (this.state.isLoading) return <Text>Loading...</Text>;

      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return compose(
    withFirebase,
    withRouter,
    withNotification
  )(WithAuthentication);
};

export default withAuthentication;
