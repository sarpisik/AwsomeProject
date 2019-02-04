import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FlatList,
  View,
  Text,
  Button
} from 'react-native';

import { compose } from 'recompose';
import { withAuthorization } from '../Auth/Session';

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
    const { firebase, authUser } = this.props;
    const { params } = this.props.navigation.state;

    this.setState({isLoading: true});

    // authUser's chats list as an array
    const chatListArr = Object.values(authUser.chatList);

    // Iterate on the list to find
    // any chat record between the
    // authUser and contact. Return back
    // path of chat record
    const chatRecord = chatListArr.find(obj => obj.contactId === params.cid);

    // If the chat record exist...
    chatRecord
      ? (
        // Then save the path in state
        this.setState({
          chatPath: chatRecord.path,
          isLoading: false,
        })
      ) : (
        this.setState({ isLoading:false })
      );
  }

  render() {
    const { navigation } = this.props;
    const { isLoading, chatPath } = this.state;

    if (isLoading) return <Text>Loading...</Text>

    return (
      <FlatList
        data={[navigation.state.params]}
        keyExtractor={(item, index) => index.toString()}
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
                path: chatPath, // Path to chat object in messages database
              })}
            />
          </View>
        )}
      />
    );
  }
}

const condition = authUser => authUser != null;

export default compose(
  withAuthorization(condition)
)(ContactScreen);

ContactScreen.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        cid : PropTypes.string.isRequired,
        name : PropTypes.string.isRequired,
        email : PropTypes.string.isRequired,
        addedTime : PropTypes.string.isRequired,
        phoneNumber : PropTypes.string,
        path: PropTypes.string,
      }),
    }),
  }),
};
