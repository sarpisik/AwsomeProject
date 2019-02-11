import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { withHeader } from "../../HOCs/withHeader";
import { withAuthorization } from "../../Session";
import * as ROUTES from "../../constants";

// SHOW CONTACT DETAILS
class ContactScreen extends Component {
  constructor(props) {
    super(props);

    const { name, cid, email, addedTime, phoneNumber } = props.location.state;

    this.state = {
      isLoading: false,
      chatPath: "",
      name: name,
      cid: cid,
      email: email,
      addedTime: addedTime,
      phoneNumber: phoneNumber,
      error: null
    };
  }

  componentDidMount() {
    const { authUser } = this.props;
    const { cid } = this.state;
    this.setState({ isLoading: true });

    // Look for an existing chat record
    const chatRecord = authUser.messagesList.find(obj => obj.contactId === cid);

    // If the chat record exist...
    chatRecord
      ? // Then save the path in state
        this.setState({
          chatPath: chatRecord.path,
          isLoading: false
        })
      : this.setState({ isLoading: false });
  }

  renderItem = ({ item }) => {
    // SHOW CONTACT INFO DETAILS
    return (
      <View>
        <View style={styles.row}>
          <Text style={styles.sender}>Name</Text>
          <Text style={styles.sender}>{item.name}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.sender}>Email</Text>
          <Text style={styles.sender}>{item.email}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.sender}>Added Time</Text>
          <Text style={styles.sender}>{item.addedTime}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.sender}>Phone</Text>
          <Text style={styles.sender}>{item.phoneNumber}</Text>
        </View>
      </View>
    );
  };

  render() {
    const {
      authUser,
      firebase,
      history,
      location: { state }
    } = this.props;
    const { isLoading, name, cid, chatPath, error } = this.state;

    if (isLoading) return <Text>Loading...</Text>;

    return (
      <View style={styles.container}>
        <FlatList
          data={[state]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={this.renderItem}
        />

        {error && <Text>{error.message}</Text>}

        {/* OPEN CHAT SCREEN ON CLICK */}
        <View style={styles.button}>
          <TouchableOpacity
            onPress={() =>
              history.push({
                pathname: `/${ROUTES.CHAT_SCREEN}`,
                state: {
                  contactName: name,
                  cid: cid,
                  path: chatPath
                }
              })
            }
          >
            <Text style={styles.send}>Send a message</Text>
          </TouchableOpacity>
        </View>

        {/* REMOVE USER */}
        <View style={styles.button}>
          <TouchableOpacity
            onPress={async () => {
              try {
                // Find contact in database
                await firebase
                  .user(authUser.uid)
                  .child(`contactsList/${item.key}`)
                  .remove();

                // Go previous screen
                history.goBack();
              } catch (error) {
                this.setState({ error });
              }
            }}
          >
            <Text style={styles.send}>{`Remove ${name}`}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default withHeader({ title: "Contact Details" })(
  withAuthorization(ContactScreen)
);

ContactScreen.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      key: PropTypes.string.isRequired,
      cid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      addedTime: PropTypes.string.isRequired,
      phoneNumber: PropTypes.string,
      path: PropTypes.string
    })
  })
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    alignSelf: "stretch",
    borderTopWidth: 1,
    borderBottomColor: "lightseagreen"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  send: {
    alignSelf: "center",
    color: "lightseagreen",
    fontSize: 16,
    fontWeight: "bold",
    padding: 20
  }
});
