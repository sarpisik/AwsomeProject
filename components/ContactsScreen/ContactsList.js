import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity
} from 'react-native';

// CONTACTS LIST
export default class ContactsList extends Component {
  renderItem = ({item}) => {
    const { onNavigate } = this.props;

    return (
      <TouchableOpacity onPress={() => onNavigate(item)}>
        <View>
          <Text>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const { data, onNavigate } = this.props;

    // authUser's list of contacts to display.
    // Use spread operator in every render
    // so that FlatList can be triggered to re-render
    let contactsList = [...data];

    // Sort list by contact's username
    contactsList.sort((objOne, objTwo) => objOne.name - objTwo.name);

    return (
      <FlatList
        data={contactsList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={this.renderItem}
      />
    );
  }
}
