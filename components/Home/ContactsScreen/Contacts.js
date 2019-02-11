import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TextInput,
  Button,
  TouchableOpacity
} from "react-native";
import ContactsList from "./ContactsList";
import * as ROUTES from "../../constants";

// PARENT COMPONENT TO PASS AUTHUSER TO ITS CHILDREN
// - ContactsList
// -AddNewContactScreen
class Contacts extends Component {
  render() {
    const { authUser, history } = this.props;

    return (
      <View style={{ justifyContent: "center" }}>
        {authUser.mergedContactsList && (
          <ContactsList data={authUser.mergedContactsList} />
        )}

        <Button
          title="Add New Contact"
          onPress={() => history.replace(`/${ROUTES.ADD_NEW_CONTACT_SCREEN}`)}
        />
      </View>
    );
  }
}

export default Contacts;
