import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TextInput
} from 'react-native';

import { compose } from 'recompose';
import { withAuthorization } from '../Auth/Session';

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

  onSubmit = async () => {
    const { authUser, firebase, navigation } = this.props;

    // Fetch users from database
    const snapshot = await firebase.users().once('value');
    const users = await snapshot.val();

    // Do search for desired email
    const isUserExist = await Object.values(users).find(user => {
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
          email: isUserExist.email,
          addedTime: firebase.serverValue.TIMESTAMP,
        });

      // Then look for existing chat record
      // with this new user, sometimes there can be
      // chat between users even they do not exist
      // in contact list
      const chatListArr = Object.values(authUser.chatList);

      const isChatRecordExist = chatListArr.find((obj, index) => {
        let isRecord = obj.contactId === isUserExist.id;

        if (isRecord) return chatListArr[index];
      });

      this.setState(
        // Clear email input
        state => ({ email: '', }),
        () => {
          // If there is a chat record already exists with this new contact...
          if (isChatRecordExist) {

            // Then navigate to ChatScreen with chatPath
            navigation.navigate('ChatScreen', {
              cid: isUserExist.id,
              contactName: isUserExist.name,
              path: isChatRecordExist.path,
            });
          } else {

            // If not navigate to ChatScreen without chatPath
            navigation.navigate('ChatScreen', {
              cid: isUserExist.id,
              contactName: isUserExist.name,
            });
          };
        }
      );

    } else {

      // Throw error if the searched email does not exist.
      const error = {
        message: 'The email adress does not exist'
      };

      this.setState({error});
    }
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

const condition = authUser => authUser != null;

export default compose(
  withAuthorization(condition)
)(AddNewContactScreen);

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
