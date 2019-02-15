// TODO: Animation between routes & sliding
// TODO: Firebase confirmation
import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  NativeRouter,
  Route,
  Switch,
  BackButton,
  Redirect
} from 'react-router-native'
import Firebase, { FirebaseContext } from './components/Firebase'
import { withAuthentication } from './components/Session'
import * as ROUTES from './components/constants'
import Home from './components/Home'
import Auth from './components/Auth'
import { ChatScreen } from './components/Home/ChatsScreen'
import {
  ContactScreen,
  AddNewContactScreen
} from './components/Home/ContactsScreen'
import PasswordChange from './components/Home/Account/PasswordChange'

class AppContainerBase extends Component {
  render() {
    const { match } = this.props
    return (
      <View style={styles.container}>
        <Switch>
          <Redirect exact from={match.path} to={`${match.path}home`} />
          <Route path="/home" component={Home} />
          <Route path={`/${ROUTES.AUTH}`} component={Auth} />
          <Route exact path={`/${ROUTES.CHAT_SCREEN}`} component={ChatScreen} />
          <Route
            exact
            path={`/${ROUTES.CONTACT_SCREEN}`}
            component={ContactScreen}
          />
          <Route
            exact
            path={`/${ROUTES.ADD_NEW_CONTACT_SCREEN}`}
            component={AddNewContactScreen}
          />
          <Route
            exact
            path={`/${ROUTES.PASSWORD_CHANGE}`}
            component={PasswordChange}
          />
        </Switch>
      </View>
    )
  }
}

const AppContainer = withAuthentication(AppContainerBase)

export default class App extends React.Component {
  render() {
    return (
      <FirebaseContext.Provider value={new Firebase()}>
        <NativeRouter>
          <BackButton>
            <AppContainer />
          </BackButton>
        </NativeRouter>
      </FirebaseContext.Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
