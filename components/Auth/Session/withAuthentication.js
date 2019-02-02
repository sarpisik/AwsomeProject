// USE THIS HOC TO WRAP THE TOP COMPONENT (APP.JS)
// SO THAT AUTH STATE PROVIDED ONCE AND ANY COMPONENT
// WHICH IS CHILD OF TOP COMPONENT (APP.JS) CAN CONSUME
// THE AUTH STATE VIA withAuthorization HOC

import React from 'react';
import { withNavigationFocus } from 'react-navigation';

// React.createContext
import { AuthUserContext } from './index';

// FIREBASE HOC
import { withFirebase } from '../../Firebase';
import { compose } from 'recompose';

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);
      // If there is no auth user in the local storage,
      // the local state will stay null untill
      // componentDidMount checks for the auth user.
      this.state = {
        authUser: null,
      };
    }

    componentDidMount() {
      console.log("---withAuthentication MOUNTED---");
      this.listener = this.props.firebase.onAuthUserListener(
        authUser => {
          this.setState({authUser});
        },
        () => {
          this.setState({ authUser: null });
        }
      );
    }

    componentWillUnmount() {
      console.log("---withAuthentication UNMOUNTED---");
      this.listener();
    }

    render() {
      this.props.isFocused
        ? console.log("---withAuthentication isFocused---")
        : console.log("---withAuthentication notFocused---");
       return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return compose(
    withFirebase
  )(WithAuthentication);
};

export default withAuthentication;
