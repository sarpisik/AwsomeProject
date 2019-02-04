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
import { AuthUserContext } from '../Auth/Session';
// import { withNavigationFocus } from 'react-navigation';
import { compose } from 'recompose';
import { withAuthorization } from '../Auth/Session';

const ShowMessages = ({messagesList, renderItem}) => (
  <FlatList
    data={messagesList}
    keyExtractor={(item, index) => index.toString()}
    renderItem={renderItem}
    inverted
  />
);

ShowMessages.propTypes = {
  messagesList: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
};

class ChatScreen extends Component {
  constructor(props) {
    super(props);

    const { authUser } = props;
    const { cid, contactName, path } = props.navigation.state.params;

    this.state = {
      text: '',
      usersIDs: {
        [cid]: contactName,
        [authUser.uid]: authUser.name,
      },
      chatPath: path || '',
      error: null,
    };
  }

  static navigationOptions = ({navigation}) => ({
    // Contact name on topbar
    title: navigation.getParam('contactName', 'Anonymous'),
  });

  renderItem = ({item}) => {
    const { authUser } = this.props;
    const { usersIDs } = this.state;

    const getSentDate = new Date(item.createdAt).toLocaleDateString();
    const getSentTime = new Date(item.createdAt).toLocaleTimeString();

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
          <Text style={styles.message}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  onSendMessage = () => {
    const { firebase, authUser } = this.props;
    const { path, cid } = this.props.navigation.state.params;

    let chatPath = path || this.state.path;

    // Use chat path if it exist already
    if (chatPath) {

      this.onCreateMessage(chatPath);
    } else {

      // If there is no chatPath already
      // create new chat object in messages database
      const newChatPath = firebase.messages().push({
        users: Object.keys(usersIDs),
        chatCreatedDate: firebase.serverValue.TIMESTAMP,
      }, error => error && this.setState({error}));

      // Then use the path of new created chat object
      // to interact in every messages
      this.onCreateMessage(newChatPath.key);

      // And also save this path into the both users database
      // for later uses
      // First save into authUser's database
      this.createChatObjectForUser(authUser.uid, cid, newChatPath.key);
      // Then save into contact's database
      this.createChatObjectForUser(cid, authUser.uid, newChatPath.key);

      // Store the new chat object's path into the state for reusebility
      this.setState({
        path: newChatPath.key,
      });
    }
  }

  onCreateMessage = path => {
    const { firebase, authUser } = this.props;
    const { cid } = this.props.navigation.state.params;

    const messageObject = {
      text: this.state.text,
      userId: authUser.uid,
      createdAt: firebase.serverValue.TIMESTAMP,
    };

    firebase.message(path).child('messages').push(
      messageObject,
      error => {
      if (error) {
        this.setState({error})
      } else {
        console.log("Message Sent!");
      }
    });

    // Clear the inputfield after update
    this.setState({
      text: '',
    });
  }

  createChatObjectForUser = (userId, contactId, path) => {
    const { firebase } = this.props;

    // Prepare the object which will send to
    // user's specified database
    const newChatRecordObject = {
      contactId: contactId,
      path: path,
    };

    // Then connect to userId's database
    const currentUser = firebase.user(userId).child('chatList');

    // and save the new object in messages record array
    currentUser.push(newChatObjectRecord);
  }

  render() {
    const { authUser, navigation: {state: { params: {cid}}}} = this.props;
    const { text, error } = this.state;

    const messagesList = authUser
      .messagesList
      .find(obj => obj.cid === cid);

      return (
      <View style={styles.container}>

        {/* DISPLAY MESSAGES */}
        <ShowMessages messagesList={messagesList.messages || []} renderItem={this.renderItem} />

        {/* INPUT FIELD */}
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.footer}>
            <TextInput
              value={text}
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="Type text"
              onChangeText={(text) => this.setState({text})}
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

const condition = authUser => authUser != null;

export default compose(
  withAuthorization(condition)
)(ChatScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sender: {
    fontWeight: 'bold',
    paddingRight: 10
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#eee'
  },
  input: {
    paddingHorizontal: 20,
    fontSize: 18,
    flex: 1
  },
  send: {
    alignSelf: 'center',
    color: 'lightseagreen',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 20
  },
});

ChatScreen.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        cid : PropTypes.string.isRequired,
        contactName : PropTypes.string.isRequired,
        path: PropTypes.string,
      }),
    }),
  }),
};
