// TODO: Animation between routes & sliding
// TODO: Firebase confirmation
// FIXME: Loading screen background bug.
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { StyleSheet, View } from 'react-native'
import {
  NativeRouter,
  Route,
  Switch,
  BackButton,
  Redirect
} from 'react-router-native'
import Firebase, { FirebaseContext } from './components/Firebase'
import store from './store'
import { withAuthentication } from './components/Session'
import * as ROUTES from './components/constants'
import Main from './components/Main'
import Auth from './components/Auth'

class AppContainerBase extends Component {
  render() {
    return (
      <NativeRouter>
        <BackButton>
          <View style={styles.container}>
            <Switch>
              <Redirect exact from={'/'} to={ROUTES.MAIN} />
              <Route path={ROUTES.MAIN} component={Main} />
              <Route path={ROUTES.AUTH} component={Auth} />
            </Switch>
          </View>
        </BackButton>
      </NativeRouter>
    )
  }
}

const AppContainer = withAuthentication(AppContainerBase)

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <FirebaseContext.Provider value={new Firebase()}>
          <AppContainer />
        </FirebaseContext.Provider>
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
    // backgroundColor: '#fff'
  }
})
