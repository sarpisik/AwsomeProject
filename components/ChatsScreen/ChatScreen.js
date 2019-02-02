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
import { withNavigationFocus } from 'react-navigation';

class ChatScreen extends Component {
  constructor(props) {
    super(props);

    const { params } = props.navigation.state;

    this.state = {
      text: '',
      messages: [],
      limit: 10,
      usersIDs: {
        [params.cid]: params.contactName,
        [params.authUser.uid]: params.authUser.name,
      },
      chatPath: '',
      error: null,
    };
  }

  static navigationOptions = ({navigation}) => ({
    // Contact name on topbar
    title: navigation.getParam('contactName', 'Anonymous'),
  });

  componentDidMount() {
    const { chatPath, contactName } = this.props.navigation.state.params;
    console.log(`${contactName} mounted in ChatsScreen`);
    // if there is already exist a chat record,
    // use its path to listen database
    if (chatPath) {
      this.setState(state => ({
        isLoading: true,
      }),
        this.onListenForMessages(chatPath)
      );
    }
  }

  componentWillUnmount() {
    const { chatPath, firebase, contactName } = this.props.navigation.state.params;
    console.log(`${contactName} unmounted in ChatsScreen`);
    chatPath &&
    firebase
      .message(chatPath)
      .child('messages')
      .off();
  }

  onListenForMessages = path => {
    const { firebase } = this.props.navigation.state.params;

    firebase
      .message(path)
      .child('messages')
      // Sort items by created time
      .orderByChild('createdAt')
      // Limit items to show
      .limitToLast(this.state.limit)
      .on('value', snapshot => {
        const messageObject = snapshot.val();

        // Convert message list object to array
        // for later use in flatlist component
        const messageList = Object.keys(messageObject).map( key => ({
          ...messageObject[key],
          path: key,
        }));

        this.setState(state => {
          return ({
            messages: messageList,
            chatPath: path,
            isLoading: false,
          })
        });
      });
  }

  onSendMessage = () => {
    const { firebase, authUser, cid } = this.props.navigation.state.params;
    const { chatPath, usersIDs } = this.state;

    // Use chatPath if it exist already
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
      this.onCreateMessage(newChatPath.key, true);

      // And also save this path into the both users database
      // for later uses
      // First save into authUser's database
      this.createChatObjectForUser(authUser.uid, cid, newChatPath.key);
      // Then save into contact's database
      this.createChatObjectForUser(cid, authUser.uid, newChatPath.key);

      // Store the new chat object's path into the state for reusebility
      this.setState({
        chatPath: newChatPath.key,
      });
    }
  }

  onCreateMessage = (path, isInitial) => {
    const { firebase, authUser, cid } = this.props.navigation.state.params;

    firebase.message(path).child('messages').push({
      text: this.state.text,
      userId: authUser.uid,
      createdAt: firebase.serverValue.TIMESTAMP,
    }, error => error && this.setState({error}));

    // Start to listen for updates in messages database from now
    isInitial && this.onListenForMessages(path);

    // Clear the inputfield after update
    this.setState({
      text: '',
    });
  }

  createChatObjectForUser = (userId, contactId, path) => {
    const { firebase } = this.props.navigation.state.params;

    // Prepare the object which will send to
    // specified user's database
    const newChatObjectRecord = {
      contactId: contactId,
      path: path,
    };

    // Then connect to userId's database
    const currentUser = firebase.user(userId).child('chatList');

    // and save the new object in messages record array
    currentUser.push(newChatObjectRecord);
  }

  renderItem = ({ item }) => {
    const { authUser } = this.props.navigation.state.params;
    const { messages, usersIDs } = this.state;

    const getSentDate = new Date(item.createdAt).toLocaleDateString();
    const getSentTime = new Date(item.createdAt).toLocaleTimeString();

    if (messages.length > 0) return (
      <View style={styles.row}>
        <Image style={styles.avatar} source={authUser.photoURL} />
        <View style={styles.rowText}>
          <View style={styles.senderRow}>
            <Text style={styles.sender}>
              {usersIDs[item.userId]}
            </Text>
            <Text style={styles.sender}>
              {`${getSentDate} - ${getSentTime}`}
            </Text>
          </View>
          <Text style={styles.message}>
            {item.text}
          </Text>
        </View>
      </View>
    );

    return <Text style={styles.message}>There are no messages to show...</Text>;
  }

  render() {
    const { navigation, isFocused } = this.props;
    const { text, messages, error } = this.state;

    isFocused
      ? console.log(`${navigation.state.params.contactName} is focused`)
      : console.log(`${navigation.state.params.contactName} is not focused`);


    return (
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={this.renderItem}
        />
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

            <TouchableOpacity onPress={this.onSendMessage}>
              <Text style={styles.send}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        {error && <Text>{error.message}</Text>}
      </View>
    );
  }
}

export default withNavigationFocus(ChatScreen);

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
        authUser : PropTypes.object.isRequired,
        cid : PropTypes.string.isRequired,
        contactName : PropTypes.string.isRequired,
        chatPath: PropTypes.string,
        firebase: PropTypes.object.isRequired,
      }),
    }),
  }),
};
