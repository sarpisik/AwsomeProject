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
      // Use this array to contain chatObjects after every
      // iterion of fetched datas from firebase
      let mergedMessagesList = [];

      // Listen for changes in firebase
      this.listener = this.props.firebase.onAuthUserListener(
        authUser => {
          // If user has chat conversion records...
          if (authUser.chatList) {
            // Iterate on the list to get every chat record objects
            Object.values(authUser.chatList).map(chatObj => {
              let mergedChatObj = {...chatObj};

              // Fetch founded chat record object's history via
              // its own path in messages database
              this.props.firebase
                .message(mergedChatObj.path)
                .child('messages')
                .orderByChild('createdAt')
                .limitToLast(10)
                .on('value', snapshot => {
                  // The list of every message objects
                  const messagesList = Object.values(snapshot.val());

                  // Merge every message objects with additional info
                  // for later use in children components
                  const messagesObj = {
                    cid: mergedChatObj.contactId,
                    path: mergedChatObj.path,
                    messages: messagesList,
                  };

                  // Always merge new message obj on messagesList
                  // to avoid duplicate of prev and next message obj
                  mergedMessagesList = [
                    messagesObj,
                    ...mergedMessagesList.filter(obj => obj.cid !== messagesObj.cid)
                  ];

                  this.setState(state => {
                    // Merge authUser with additional infos
                    let mergedAuthUser = {
                      ...state.authUser,
                      ...authUser,
                      messagesList: mergedMessagesList,
                    };

                    return ({
                      authUser: mergedAuthUser,
                    })
                  })
                });
            });
          } else {
            this.setState({authUser});
          }
        },
        () => {
          this.setState({ authUser: null });
        }
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
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
