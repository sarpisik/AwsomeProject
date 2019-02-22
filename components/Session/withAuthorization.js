import React from 'react'

// React.createContext
import { AuthUserContext } from './index'
import { withRouter } from 'react-router-native'
import { withFirebase } from '../Firebase'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import * as ROUTES from '../constants'
import { LayoutAnimation } from 'react-native'
import Loading from '../Loading'

const condition = authUser => authUser != null

const withAuthorization = Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      const { firebase, history } = this.props
      // If authUser does not exist then redirect to login page
      this.listener = firebase.onAuthUserListener(
        authUser => {
          if (!condition(authUser)) {
            history.replace({ pathname: ROUTES.AUTH })
          }
        },
        () => history.replace({ pathname: ROUTES.AUTH })
      )
    }

    componentWillUnmount() {
      this.listener()
    }

    render() {
      // LayoutAnimation.easeInEaseOut()
      return condition(this.props.authUser) ? (
        <Component {...this.props} />
      ) : null
    }
  }

  const mapStateToProps = state => ({
    authUser: state.sessionState.authUser,
    contacts: state.contactState.contacts,
    messages: state.messageState.messages,
    limit: state.messageState.limit
  })

  const mapDispatchToProps = dispatch => ({
    onSetContacts: contacts => dispatch({ type: 'CONTACT_SET', contacts }),
    onSetMessages: messages => dispatch({ type: 'MESSAGES_SET', messages })
  })

  return compose(
    withRouter,
    withFirebase,
    connect(
      mapStateToProps,
      mapDispatchToProps
    )
  )(WithAuthorization)
}

export default withAuthorization
