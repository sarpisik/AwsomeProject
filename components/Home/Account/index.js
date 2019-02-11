import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, FlatList, Text, Image } from "react-native";

import { compose } from "recompose";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";

import SignOut from "../../Auth/SignOut";

const showAccountInfoList = [
  "email",
  "creationTime",
  "name",
  "phoneNumber",
  "photoURL"
];

const AccountDetails = ({ authUser }) => {
  // const imageUrl = authUser.photoURL
  //   ? {uri: authUser.photoURL}
  //   : require('../assets/profile_picture.png');

  const creationTime = new Date(authUser.creationTime).toUTCString();

  return (
    <>
      <View>
        <Image style={styles.image} source={authUser.photoURL} />
      </View>
      <View>
        <Text>{authUser.email}</Text>
      </View>
      <View>
        <Text>{authUser.name}</Text>
      </View>
      <View>
        <Text>{creationTime}</Text>
      </View>
      <View>
        <Text>{authUser.phoneNumber}</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 150
  }
});

AccountDetails.propTypes = {
  authUser: PropTypes.object.isRequired
};

const Account = ({ firebase, authUser }) => {
  return (
    <View>
      <AccountDetails authUser={authUser} firebase={firebase} />
      <SignOut />
    </View>
  );
};

Account.propTypes = {
  firebase: PropTypes.object.isRequired
};

export default Account;
