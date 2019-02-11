import React, { Component } from "react";
import PropTypes from "prop-types";
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
} from "react-native";
import { Link } from "react-router-native";
import * as ROUTES from "../../constants";

// CHAT LIST
class ChatList extends Component {
  renderItem = ({ item }) => {
    const { authUser } = this.props;
    const getSentDate = new Date(item.messages[0].createdAt).toLocaleDateString();
    const getSentTime = new Date(item.messages[0].createdAt).toLocaleTimeString();
    return (
      <Link
        to={{
          pathname: `/${ROUTES.CHAT_SCREEN}`,
          state: {
            contactName: item.contactName || item.userEmail,
            cid: item.contactId,
            path: item.path
          }
        }}
      >
      <View style={styles.row}>
          {/* Profile Photo */}
          <Image style={styles.avatar} source={authUser.photoURL} />

          {/* Chat */}
          <View style={styles.rowText}>
            <View style={styles.senderRow}>
              {/* Contact Name */}
              <Text style={styles.sender}>
                {item.contactName || item.userEmail}
              </Text>

              {/* Sent Time */}
              <Text style={styles.sender}>
                {`${getSentDate} - ${getSentTime}`}
              </Text>
            </View>

            {/* Latest Text */}
            <Text style={styles.message}>{item.messages[0].text}</Text>
          </View>
        </View>
      </Link>
    );
  };

  render() {
    const { data } = this.props;

    // authUser's list of messages to display.
    let messagesList = [...data];

    // Sort list by latest text at top
    messagesList.sort(
      (firstObj, secondObj) =>
        secondObj.messages[0].createdAt - firstObj.messages[0].createdAt
    );
    // console.log("AUTHUSER FROM CHATLIST, ", messagesList);
    return (
      <FlatList
        data={messagesList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={this.renderItem}
      />
    );
  }
}

export default ChatList;

const styles = StyleSheet.create({
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
  }
});
