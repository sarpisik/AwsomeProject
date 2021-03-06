import React from 'react'

// React.createContext
import { AuthUserContext } from './index'
import { withRouter } from 'react-router-native'
import { withFirebase } from '../Firebase'
import { compose } from 'recompose'
import * as ROUTES from '../constants'
import { LayoutAnimation } from 'react-native'
import Loading from '../Loading'

const condition = authUser => authUser != null

const withAuthorization = Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      console.log('WithAuthorization mounted')
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
      console.log('WithAuthorization unmounted')
      this.listener()
    }

    onConditionRender = ({
      authUser,
      onLoader,
      isLoadComplete,
      isChatsLoadComplete
    }) =>
      condition(authUser) ? (
        <Component
          {...this.props}
          authUser={authUser}
          onLoader={onLoader}
          isLoadComplete={isLoadComplete}
          isChatsLoadComplete={isChatsLoadComplete}
        />
      ) : null

    render() {
      // LayoutAnimation.easeInEaseOut()
      return (
        <AuthUserContext.Consumer>
          {this.onConditionRender}
        </AuthUserContext.Consumer>
      )
    }
  }

  return compose(
    withRouter,
    withFirebase
  )(WithAuthorization)
}

export default withAuthorization
