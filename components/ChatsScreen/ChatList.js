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

import { compose } from 'recompose';
import { withNavigationFocus } from 'react-navigation';
import withNotification from '../withNotification';

// CHAT LIST
class ChatList extends Component {
  renderItem = ({item}) => {
    const { onNavigate } = this.props;

    return (
      <TouchableOpacity onPress={() => onNavigate(item)}>
        <View>
          {/* Contact Name */}
          <Text>
            {item.contactName}
          </Text>
          {/* Latest Message */}
          <Text>
            {item.messages[0].text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const { onNavigate, data } = this.props;

    // authUser's list of messages to display.
    let messagesList = [...data];

    // Sort list by latest text at top
    messagesList.sort((firstObj, secondObj) => secondObj.messages[0].createdAt - firstObj.messages[0].createdAt);
    // console.log("AUTHUSER FROM CHATLIST, ",messagesList)
    return (
      <View>
        <FlatList
          data={messagesList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={this.renderItem}
        />
      </View>
    );


  }
}

export default compose(
  withNotification,
  withNavigationFocus
)(ChatList);
