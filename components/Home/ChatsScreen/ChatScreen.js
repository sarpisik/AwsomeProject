import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image
} from "react-native";

import { withAuthorization } from "../../Session";
import Header from "../../HOCs/withHeader";

const ShowMessages = ({ messagesList, renderItem, extraData }) => {
  return (
    <FlatList
      data={messagesList}
      extraData={extraData}
      // removeClippedSubviews={false}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      inverted
    />
  );
};

ShowMessages.propTypes = {
  messagesList: PropTypes.array,
  renderItem: PropTypes.func.isRequired
};

class ChatScreen extends Component {
  constructor(props) {
    super(props);

    const {
      authUser,
      location: {
        state: { contactName, cid, path }
      }
    } = props;

    this.state = {
      text: "",
      messagesList: [],
      usersIDs: {
        [cid]: contactName,
        [authUser.uid]: authUser.name
      },
      chatPath: path || "",
      error: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    const {
      authUser,
      location: {
        state: { cid }
      }
    } = props;
    const isChatList = authUser.messagesList.find(obj => obj.contactId === cid);
    const messagesList = (isChatList && isChatList.messages) || [];

    if (messagesList !== state.messagesList) {
      // this.handleReadMessage(messagesList[0]);
      return {
        messagesList: messagesList
      };
    }
    return null;
  }

  // Display messages in ShowMessages component
  renderItem = ({ item }) => {
    const { authUser } = this.props;
    const { usersIDs } = this.state;

    const getSentDate = new Date(item.createdAt).toLocaleDateString();
    const getSentTime = new Date(item.createdAt).toLocaleTimeString();

    console.log("item.isRead ,", typeof item.isRead, item.isRead);

    const textColor =
      item.userId === authUser.uid
        ? item.isRead === "true"
          ? styles.read
          : styles.unRead
        : styles.read;

    return (
      <View style={styles.row}>
        {/* Profile Photo */}
        <Image style={styles.avatar} source={authUser.photoURL} />

        {/* Message */}
        <View style={styles.rowText}>
          <View style={styles.senderRow}>
            {/* Sender Name or ID */}
            <Text style={styles.sender}>
              {usersIDs[item.userId] || item.userId}
            </Text>

            {/* Sent Time */}
            <Text style={styles.sender}>
              {`${getSentDate} - ${getSentTime}`}
            </Text>
          </View>

          {/* Text */}
          <Text style={[styles.message, textColor]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  // On press Send button or submit input
  onSendMessage = async () => {
    const {
      firebase,
      authUser,
      location: {
        state: { cid, path }
      }
    } = this.props;
    const { usersIDs } = this.state;

    let chatPath = path || this.state.path;

    // Use chat path if it exist already
    if (chatPath) {
      this.onCreateMessage(chatPath);
    } else {
      // If there is no chatPath already
      // create new chat object in messages database
      const newChatPath = await firebase.messages().push(
        {
          users: Object.keys(usersIDs),
          chatCreatedDate: firebase.serverValue.TIMESTAMP
        },
        error => error && this.setState({ error })
      );

      // And also save this path into the both users database
      // for later uses
      // First save the path into authUser's database
      await this.createChatObjectForUser(authUser.uid, cid, newChatPath.key);
      // Then save the path into contact's database
      await this.createChatObjectForUser(cid, authUser.uid, newChatPath.key);

      // Store the new chat object's path in the state for reusebility
      await this.setState({
        path: newChatPath.key
      });

      // Then use the path of new created chat object
      // to interact in every messages
      this.onCreateMessage(this.state.path);
    }
  };

  onCreateMessage = async path => {
    const {
      firebase,
      authUser,
      location: {
        state: { cid }
      }
    } = this.props;

    const messageObject = await {
      text: this.state.text,
      userId: authUser.uid,
      isRead: "false",
      createdAt: firebase.serverValue.TIMESTAMP
    };

    await firebase
      .message(path)
      .child("messages")
      .push(messageObject, error => {
        if (error) {
          this.setState({ error });
        } else {
          console.log("Message Sent!");
        }
      });

    // Clear the inputfield after update
    this.setState({
      text: ""
    });
  };

  createChatObjectForUser = (userId, contactId, path) => {
    const { firebase } = this.props;

    // Prepare the object which will send to
    // user's specified database
    const newChatObjectRecord = {
      contactId: contactId,
      path: path
    };

    // Then connect to userId's database
    const currentUser = firebase.user(userId).child("chatList");

    // and save the new object in messages record array
    currentUser.push(newChatObjectRecord);
  };

  handleReadMessage = cid => {
    const { firebase, authUser } = this.props;
    const { chatPath, messagesList } = this.state;

    const contactUserMessages = messagesList.filter(
      messageObject =>
        messageObject.userId === cid && messageObject.isRead === "false"
    );
    console.log("contactUserMessages ,", contactUserMessages);

    contactUserMessages.forEach(messageObject => {
      firebase
        .message(chatPath)
        .child(`messages/${messageObject.key}/isRead`)
        .set("true");
    });
  };

  render() {
    const {
      authUser,
      history,
      location: {
        state: { cid, contactName }
      }
    } = this.props;
    const { text, error, messagesList } = this.state;

    console.log("ChatScreen rendered ,", messagesList);

    this.handleReadMessage(cid);
    return (
      <View style={styles.container}>
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
              underlineColorAndroid="transparent"
              placeholder="Type text"
              onChangeText={text => this.setState({ text })}
              onSubmitEditing={this.onSendMessage}
            />

            {/* SEND BUTTON */}
            <TouchableOpacity onPress={this.onSendMessage}>
              <Text style={styles.send}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* DISPLAY ERROR */}
        {error && <Text>{error.message}</Text>}
      </View>
    );
  }
}

export default withAuthorization(ChatScreen);

ChatScreen.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      cid: PropTypes.string.isRequired,
      contactName: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  })
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  row: {
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  avatar: {
    borderRadius: 20,
    width: 40,
    height: 40,
    marginRight: 10
  },
  rowText: {
    flex: 1
  },
  message: {
    fontSize: 18
  },
  senderRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sender: {
    fontWeight: "bold",
    paddingRight: 10
  },
  footer: {
    flexDirection: "row",
    backgroundColor: "#eee"
  },
  input: {
    paddingHorizontal: 20,
    fontSize: 18,
    flex: 1
  },
  read: { color: "navy" },
  unRead: { color: "red" },
  send: {
    alignSelf: "center",
    color: "lightseagreen",
    fontSize: 16,
    fontWeight: "bold",
    padding: 20
  }
});
