// TODO: Animation between routes & sliding
// TODO: Firebase confirmation
// FIXME: Loading screen background bug.
import React, { Component } from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'
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
import { TransLeft } from './components/Animations'

const subScreens = {
  [`${ROUTES.MAIN}${ROUTES.CHAT_SCREEN}`]: {
    component: ChatScreen
  },
  [`${ROUTES.MAIN}${ROUTES.CONTACT_SCREEN}`]: {
    component: ContactScreen
  },
  [`${ROUTES.MAIN}${ROUTES.ADD_NEW_CONTACT_SCREEN}`]: {
    component: AddNewContactScreen
  },
  [`${ROUTES.MAIN}${ROUTES.PASSWORD_CHANGE}`]: {
    component: PasswordChange
  }
}

const { width } = Dimensions.get('window')

class Main extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isVisible: false,
      cacheScreen: null,
      cacheData: null
    }
  }

  static getDerivedStateFromProps(props, state) {
    const {
      location,
      location: { pathname }
    } = props

    if (subScreens[pathname])
      return {
        cacheScreen: subScreens[pathname].component,
        cacheData: location.state,
        isVisible: true
      }
    if (state.cacheScreen)
      return {
        isVisible: false
      }

    return null
  }

  render() {
    const { isVisible, cacheScreen, cacheData } = this.state
    const Screen = cacheScreen

    return (
      <View style={styles.container}>
        <TransLeft
          width={width / 6}
          reverse={-1}
          duration={500}
          visible={!isVisible}>
          <Home />
        </TransLeft>
        <TransLeft duration={350} visible={isVisible}>
          {cacheScreen && <Screen state={cacheData} />}
        </TransLeft>
      </View>
    )
  }
}

class AppContainerBase extends Component {
  render() {
    const { match, history } = this.props
    console.log('AppContainerBase Rendered history ,', history)
    return (
      <View style={styles.container}>
        <Switch>
          <Redirect exact from={match.path} to={ROUTES.MAIN} />
          <Route path={ROUTES.MAIN} component={Main} />
          <Route path={ROUTES.AUTH} component={Auth} />
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
    flex: 1,
    backgroundColor: '#fff'
  }
})
