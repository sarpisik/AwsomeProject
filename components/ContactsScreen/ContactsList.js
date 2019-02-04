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
            <TouchableOpacity onPress={() => onNavigate(item)}>
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
