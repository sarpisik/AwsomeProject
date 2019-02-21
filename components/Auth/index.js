import React, { Component } from 'react'
import { Dimensions, BackHandler, View } from 'react-native'
import { Route, Switch } from 'react-router-native'
import * as ROUTES from '../constants'
import SignInScreen from './SignInScreen'
import SignUpScreen from './SignUpScreen'
import { TransLeft, Fade } from '../Animations'

const { width } = Dimensions.get('window')

// Links for lazy load pages
const subScreens = {
  [`${ROUTES.AUTH}${ROUTES.SIGN_UP}`]: SignUpScreen
}

// Run page by referred link
const Page = ({ match }) => {
  const Component = subScreens[match.params.screenId]
  return <Component />
}

class Auth extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isVisible: false,
      cacheScreen: null
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { pathname } = props.location

    if (subScreens[pathname])
      return {
        cacheScreen: subScreens[pathname],
        isVisible: true
      }
    if (state.cacheScreen)
      return {
        isVisible: false
      }

    return null
  }

  componentDidMount = () => {
    const { match, history } = this.props

    // Prevent navigate back for android devices on back button press
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // If user in chat list screen when pressed on back button
      if (history.location.pathname === match.path) {
        // Then kill app
        return false
      }

      // If user not in Sign In screen when pressed back button
      history.location.pathname !== match.path &&
        // navigate to Sign In screen
        history.replace(ROUTES.AUTH)
      return true
    })
  }

  componentWillUnmount() {
    this.backHandler.remove()
  }

  render() {
    const { isVisible, cacheScreen, cacheData } = this.state
    const Screen = cacheScreen
    const { match, location } = this.props

    return (
      <View style={{ flex: 1 }}>
        <TransLeft
          width={width / 6}
          reverse={-1}
          duration={500}
          visible={!isVisible}>
          <SignInScreen />
        </TransLeft>
        <TransLeft duration={350} visible={isVisible}>
          {cacheScreen && <Screen state={cacheData} />}
        </TransLeft>
      </View>
    )
  }
}

export default Auth
