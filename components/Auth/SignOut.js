import React from 'react';
import { Button } from 'react-native';

import { compose } from 'recompose';
import { withNavigation } from 'react-navigation';
import { withFirebase } from '../Firebase';

const SignOut  = ({
  firebase,
  navigation,
}) => {
  const signOut = _ => {
    // FIREBASE API
    firebase.doSignOut()
    .then(() => {

      // REDIRECT TO HOME
      navigation.navigate('SignIn')
    });
  }
  
  return (
    <Button title="Sign Out" onPress={ signOut } />
  )
}

export default compose(
  withFirebase,
  withNavigation
)(SignOut);
