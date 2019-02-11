import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text, TextInput } from "react-native";

import { withHeader } from "../../HOCs/withHeader";
import { withAuthorization } from "../../Session";
import * as ROUTES from "../../constants";

// ADD NEW CONTACT
class AddNewContactScreen extends Component {
  constructor(props) {
    super(props);

    this.state = { email: "", error: null };
  }
  onSubmit = async () => {
    const { authUser, firebase, history } = this.props;

    const users = await firebase
      .users()
      .orderByChild("email")
      .equalTo(this.state.email)
      .once("value");

    const isUser = await users.val();

    // If searched email does exist in the users database
    if (isUser) {
      const user = Object.values(isUser);
      // Save the searched user as a contact into authUser's contacts list
      const sendNewUser = await firebase
        .user(authUser.uid)
        .child("contactsList")
        .push({
          cid: user[0].id,
          email: user[0].email,
          addedTime: firebase.serverValue.TIMESTAMP
        });

      // Fetch updated contacts list
      const snapshot = await firebase
        .user(authUser.uid)
        .child("contactsList")
        .once("value");
      const contacts = await snapshot.val();
      // Get the added time of last added contact
      const createdTime = await contacts[sendNewUser.key].addedTime;

      // Create this object to send contact details screen
      const contactObject = await {
        key: sendNewUser.key,
        cid: user[0].id,
        name: user[0].name,
        email: user[0].email,
        addedTime: new Date(createdTime).toUTCString()
      };

      // Navigate to ContactScreen
      history.replace({
        pathname: `/${ROUTES.CONTACT_SCREEN}`,
        state: contactObject
      });
    } else {
      // Throw error if the searched email does not exist.
      const error = {
        message: "The email does not exist"
      };

      this.setState({ error });
    }
  };

  render() {
    const { email, error } = this.state;

    return (
      <View>
        <Text style={{ padding: 10 }}>email : {email}</Text>
        <TextInput
          style={{
            height: 40,
            width: "80%",
            borderColor: "gray",
            borderWidth: 1,
            padding: 10,
            marginBottom: 20
          }}
          onChangeText={email => this.setState({ email })}
          value={email}
          onSubmitEditing={this.onSubmit}
        />
        {error && <Text>{error.message}</Text>}
      </View>
    );
  }
}

export default withHeader({ title: "New Contact" })(
  withAuthorization(AddNewContactScreen)
);

AddNewContactScreen.propTypes = {
  authUser: PropTypes.object.isRequired,
  firebase: PropTypes.object.isRequired
};
