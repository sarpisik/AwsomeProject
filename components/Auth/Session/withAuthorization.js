import React from 'react';

// React.createContext
import { AuthUserContext } from './index';
import { withNavigation } from 'react-navigation';
import { withFirebase } from '../../Firebase';
import { compose } from 'recompose';

const withAuthorization = condition => Component => {
  class WithAuthorization extends React.Component {

    componentDidMount() {
      const { firebase, navigation } = this.props;
      // If authUser does not exist then redirect to login page
      this.listener = firebase.onAuthUserListener(
        authUser => {
          if (!condition(authUser)) {
            navigation.navigate('SignIn');
          }
        },
        () => navigation.navigate('SignIn')
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser =>
            condition(authUser)
              ? <Component {...this.props} authUser={authUser} />
              : null
          }
        </AuthUserContext.Consumer>

      );
    }
  }

  return compose(
    withNavigation,
    withFirebase,
  )(WithAuthorization);
};

export default withAuthorization;
