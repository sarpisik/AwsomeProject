import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {View,
  Text,
  TextInput
} from 'react-native';

// ADD NEW CONTACT
export default class AddNewContactScreen extends Component {
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
