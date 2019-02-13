import React, { Component } from "react";
import PropTypes from "prop-types";
import { FlatList } from "react-native";
import { Link } from "react-router-native";
import * as ROUTES from "../../constants";
import List from "../../List";

// CHAT LIST
class ChatList extends Component {
  renderItem = ({ item }) => {
    const { authUser } = this.props;
    const getSentDate = new Date(
      item.messages[0].createdAt
    ).toLocaleDateString();
    const getSentTime = new Date(
      item.messages[0].createdAt
    ).toLocaleTimeString();
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
        <List
          title={item.name || item.userEmail}
          subTitle={item.messages[0].text}
          image={authUser.photoURL}
          date={`${getSentDate} - ${getSentTime}`}
          line={1}
        />
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
