import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, FlatList, Text, TextInput, Button, TouchableOpacity } from 'react-native';

import { withFirebase } from './Firebase';
import { AuthUserContext } from './Auth/Session';

// ADD NEW CONTACT
class AddNewContactScreen extends Component {
  constructor(props) {
    super(props);

    this.state = { email: '', error: null };
  }
  // SET TITLE AT TOP BAR
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('title', 'Anonymous'),
  });

  onSubmit = () => {
    const { navigation } = this.props;
    const authUser = navigation.getParam('authUser');
    const firebase = navigation.getParam('firebase');

    firebase
      .users()
      .once('value', snapshot => {
        const users = snapshot.val();

        const isUserExist = Object.values(users).find(user => {
          // Do search for desired email
          const contact = user.email === this.state.email;

          if (contact) return user;
        });

        // If searched email does exist in the users database
        if (isUserExist) {

          // Save the searched user as a contact into authuser's contacts list
          firebase
            .user(authUser.uid)
            .child('contactsList')
            .push({
              cid: isUserExist.id,
              addedTime: firebase.serverValue.TIMESTAMP,
            });

          // Then look for existing chat record
          // with this new user, sometimes there can be
          // chat between users even they do not exist
          // in contact list
          firebase
            .user(authUser.uid)
            .child('chatList')
            .once('value', snapshot => {
              const chatsObject = snapshot.val();

              // If is there any record exist
              if (chatsObject) {

                // Then look for the desired record object for path
                const isChatRecordExist = Object.keys(chatsObject).find(key => {
                  let isRecord = chatsObject[key].contactId === isUserExist.id;

                  // Return the chat record object if founded
                  if (isRecord) return key;
                });

                // Pass the chatPath to show existing
                // texts in chat screen
                if (isChatRecordExist) {

                  // Then navigate to ChatScreen
                  navigation.navigate('ChatScreen', {
                    authUser: authUser,
                    cid: isUserExist.id,
                    contactName: isUserExist.name,
                    chatPath: chatsObject[isChatRecordExist].path,
                    firebase: firebase,
                  });
                } else {

                  // Navigate to ChatScreen without chatPath
                  navigation.navigate('ChatScreen', {
                    authUser: authUser,
                    cid: isUserExist.id,
                    contactName: isUserExist.name,
                    firebase: firebase,
                  });
                };
              } else {

                // Navigate to ChatScreen without chatPath
                navigation.navigate('ChatScreen', {
                  authUser: authUser,
                  cid: isUserExist.id,
                  contactName: isUserExist.name,
                  firebase: firebase,
                });
              }
            })
        } else {

          // Throw error if the searched email does not exist.
          const error = {
            message: 'The email adress does not exist'
          };

          this.setState({error});
        }
      })
  }

  render() {
    const { email, error } = this.state;

    return (
      <View>
        <Text>
          email : {email}
        </Text>
        <TextInput
          style={{
            height: 40,
            width: '80%',
            borderColor: 'gray',
            borderWidth: 1,
            padding: 10,
            marginBottom: 20,
          }}
          onChangeText={(email) => this.setState({email})}
          value={email}
          onSubmitEditing={this.onSubmit}
        />
        {error && <Text>{error.message}</Text>}
      </View>
    );
  }
}

AddNewContactScreen.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        authUser: PropTypes.object.isRequired,
        firebase: PropTypes.object.isRequired,
      })
    })
  })
};

// SHOW CONTACT DETAILS
class ContactScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      chatPath: '',
    };
  }
  // Show contact name at title bar
  static navigationOptions = ({navigation}) => ({
    title: "Contact Details",
  });

  componentDidMount() {
    const { params } = this.props.navigation.state;

    this.setState({isLoading: true});

    // Connect to database
    // and look for existing chat record
    // store the path of chat record
    // in state if exist.
    // If not, leave it empty.
    params.firebase
      .user(params.authUser.uid)
      .child('chatList')
      .on('value', snapshot => {
        const chatsObject = snapshot.val();

        // If is there any record exist
        if (chatsObject) {

          // Then look for the desired record object for path
          const isChatRecordExist = Object.keys(chatsObject).find(key => {
            let isRecord = chatsObject[key].contactId === params.cid;

            // Return the chat record object if founded
            if (isRecord) return key;
          });

          // Store the recorded object path for later use
          // like passing the path via navigate to chat screen
          if (isChatRecordExist) {
            this.setState({
              isLoading: false,
              chatPath: chatsObject[isChatRecordExist].path,
            });
          } else {
            this.setState({isLoading: false});
          }
        } else {
          this.setState({isLoading: false});
        }
      })
  }

  componentWillUnmount() {
    const { params } = this.props.navigation.state;
    params.firebase
      .user(params.authUser.uid)
      .child('chatList')
      .off();
  }

  render() {
    const { navigation } = this.props;
    const { isLoading, chatPath } = this.state;

    if (isLoading) return <Text>Loading...</Text>

    return (
      <FlatList
        data={[navigation.state.params]}
        renderItem={({item}) => (
          <View>

            {/* SHOW CONTACT INFO DETAILS */}
            <Text>Name: {item.name}</Text>
            <Text>Email: {item.email}</Text>
            <Text>Added Time: {item.addedTime}</Text>
            <Text>Phone: {item.phoneNumber}</Text>

            {/* OPEN CHAT SCREEN ON CLICK */}
            <Button
              title="Send a message"
              onPress={() => navigation.navigate('ChatScreen', {
                contactName: item.name, // Contact name
                cid: item.cid, // Contact Id
                authUser: item.authUser, // User Id(Sender)
                chatPath: chatPath, // Path to chat object in messages database
                firebase: item.firebase,
              })}
            />
          </View>
        )}
      />
    );
  }
}

// CONTACTS LIST
class ContactList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contactsList: [],
      authUser: props.authUser,
      isLoading: false,
    };
  }

  componentDidMount() {
    const { firebase } = this.props;
    const { authUser } = this.state;

    this.setState({isLoading: true})

    // Fetch contactsList
    firebase
      .user(authUser.uid)
      .child('contactsList')
      .on('value', snapshot => {
        const contactsObject = snapshot.val();

        // If this is not a new user
        if (contactsObject) {

          // Conver contactsList object to Array
          let contactsIdList = Object.keys(contactsObject).map(key => ({
            ...contactsObject[key],
          }));

          // Update the every contact in the list
          // with current name and email
          contactsIdList.map(contact => {
            firebase
              .user(contact.cid)
              .once('value', snapshot => {
                let contactObject= snapshot.val();

                contact.name = contactObject.name;
                contact.email = contactObject.email;

                this.setState({
                  contactsList: [...contactsIdList],
                  isLoading: false,
                });
              })
          });
        } else {
          this.setState({ isLoading: false });
        }
      })
  }

  componentWillUnmount() {
    this.props.firebase
      .user(this.state.authUser.uid)
      .child('contactsList')
      .off();
  }

  render() {
    const { onNavigate } = this.props;
    const { authUser, isLoading } = this.state;

    if (isLoading) return <Text>Loading...</Text>;

    return (
      <FlatList
        data={this.state.contactsList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          // Navigate to ContactScreen on click
          // to show contact details
            <TouchableOpacity onPress={() => onNavigate(authUser, item)}>
              <View>
                <Text>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
        )}
      />
    );
  }

}

// PARENT COMPONENT TO PASS AUTHUSER TO ITS CHILDREN
// - ContactList
// -AddNewContactScreen
class Contacts extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('title', 'Contacts'),
  });

  // When pressed on a contact in ContactList component
  onNavigate = (authUser, contact) => {
    const { firebase } = this.props;
    const { navigate } = this.props.navigation;

    // Navigate to ContactScreen
    // to show details of pressed contact
    navigate('ContactScreen', {
      authUser: authUser,
      cid: contact.cid,
      name: contact.name,
      email: contact.email,
      addedTime: new Date(contact.addedTime).toUTCString(),
      firebase: firebase,
    })
  }

  render() {
    const { firebase } = this.props;
    const { navigate } = this.props.navigation;

    return (
      <AuthUserContext.Consumer>
        {authUser =>
          <View style={{ justifyContent: "center" }}>

            <ContactList
              authUser={authUser}
              firebase={firebase}
              onNavigate={this.onNavigate}
            />

            <Button
              title="Add New Contact"
              onPress={() => navigate('AddNewContactScreen', {
                authUser: authUser,
                firebase: this.props.firebase,
                title: 'Add New Contact'
              })}
            />
          </View>
        }
      </AuthUserContext.Consumer>
    );
  }
}

export default withFirebase(Contacts);

export { ContactScreen, AddNewContactScreen };
