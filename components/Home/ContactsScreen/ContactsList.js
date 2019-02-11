import React, { Component } from "react";
import PropTypes from "prop-types";
import { FlatList, View, Text, TouchableOpacity } from "react-native";
import { Link } from "react-router-native";
import * as ROUTES from "../../constants";

// CONTACTS LIST
export default class ContactsList extends Component {
  renderItem = ({ item }) => {
    console.log("item from contactslist ,", item);
    return (
      <Link
        to={{
          pathname: `/${ROUTES.CONTACT_SCREEN}`,
          state: {
            key: item.key,
            cid: item.cid,
            name: item.name,
            email: item.email,
            addedTime: new Date(item.addedTime).toUTCString()
          }
        }}
      >
        <View>
          {/* Contact Name */}
          <Text>{item.name}</Text>
        </View>
      </Link>
    );
  };

  render() {
    const { data } = this.props;

    // authUser's list of contacts to display.
    // Use spread operator in every render
    // so that FlatList can be triggered to re-render
    let contactsList = [...data];

    // Sort list by contact's username
    contactsList.sort((objOne, objTwo) => objOne.name - objTwo.name);

    return (
      <FlatList
        data={contactsList}
        extraData={contactsList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={this.renderItem}
      />
    );
  }
}
