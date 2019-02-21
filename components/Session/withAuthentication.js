// USE THIS HOC TO WRAP THE TOP COMPONENT (APP.JS)
// SO THAT AUTH STATE PROVIDED ONCE AND ANY COMPONENT
// WHICH IS CHILD OF TOP COMPONENT (APP.JS) CAN CONSUME
// THE AUTH STATE VIA withAuthorization HOC
// TODO: CHECK PROPTYPES FOR EVERY COMPONENT
// TODO: Set password change & reset
// TODO: Create loading screen

import React from 'react'
import { connect } from 'react-redux'
import { View } from 'react-native'
import { withRouter } from 'react-router-native'

// FIREBASE HOC
import { withFirebase } from '../Firebase'
import { compose } from 'recompose'
import Loading from '../Loading'

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props)
      // If there is no auth user in the local storage,
      // the local state will stay null until
      // componentDidMount checks for the auth user.
      this.state = {
        isLoading: false
      }
    }

    componentDidMount() {
      const { firebase, onSetAuthUser } = this.props

      this.setState({ isLoading: true })

      // Listen for changes in firebase for
      // authentication status of the current authUser
      this.listener = firebase.onAuthUserListener(
        async authUser => {
          // If the authUser exist, save it in Redux store
          await onSetAuthUser(authUser)
          setTimeout(() => {
            this.setState({ isLoading: false })
          }, 1000)
        },
        () => {
          // If there is no authUser, keep it null
          // so that private screens are protected
          // along this is null
          onSetAuthUser(null)
          setTimeout(() => {
            this.setState({ isLoading: false })
          }, 1000)
        }
      )
    }

    componentWillUnmount() {
      this.listener()
    }

    render() {
      return this.state.isLoading ? <Loading /> : <Component {...this.props} />
    }
  }
  const mapDispatchToProps = dispatch => ({
    onSetAuthUser: authUser => dispatch({ type: 'AUTH_USER_SET', authUser })
  })

  return compose(
    // withLoader,
    withFirebase,
    connect(
      null,
      mapDispatchToProps
    )
    // withNotification
  )(WithAuthentication)
}

export default withAuthentication
