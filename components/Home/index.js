// TODO: Config route on swipe
import React, { PureComponent } from 'react'
import { Route, Link, Switch, Redirect } from 'react-router-native'
import {
  FlatList,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
  BackHandler
} from 'react-native'
import { withAuthorization } from '../Session'
import * as ROUTES from '../constants'

import { Header } from 'react-native-elements'
import { Entypo } from '@expo/vector-icons'
import Contacts from './ContactsScreen'
import Chats from './ChatsScreen'
import Account from './Account'

const { width } = Dimensions.get('window')

const iconStyle = {
  color: '#61dafb',
  size: 25
}

const screensIndex = {
  [`/${ROUTES.HOME}/${ROUTES.CHATS}`]: 0,
  [`/${ROUTES.HOME}/${ROUTES.CONTACTS}`]: 1,
  [`/${ROUTES.HOME}/${ROUTES.ACCOUNT}`]: 2
}

// Links for lazy load pages
const screens = [
  {
    component: Chats,
    title: 'Chats',
    icon: 'new-message',
    onPress: history => history.push(`/${ROUTES.ADD_NEW_CONTACT_SCREEN}`)
  },
  {
    component: Contacts,
    title: 'Contacts',
    icon: 'add-user',
    onPress: history => history.push(`/${ROUTES.ADD_NEW_CONTACT_SCREEN}`)
  },
  {
    component: Account,
    title: 'Account',
    icon: 'log-out',
    onPress: (history, firebase) => {
      firebase.doSignOut().then(() => {
        history.entries = []
        history.index = -1

        history.push(`/${ROUTES.AUTH}`)
      })
    }
  }
]

// Run page by referred link

export class Home extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      authUser: null,
      history: null
    }
    // this.anim = new Animated.Value(0)
  }

  static getDerivedStateFromProps(props, state) {
    const { authUser, history } = props

    if (authUser !== state.authUser || history !== state.history) {
      return {
        authUser
      }
    }
    return null
  }

  componentDidMount() {
    const { match, history } = this.props

    // Avoid scroll failed
    history.location.pathname !== `${match.url}/${ROUTES.CHATS}` &&
      setTimeout(() => {
        this.onScrollToIndex(history.location.pathname, false)
      }, 100)

    // Prevent navigate back for android devices on back button press
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // If user in chat list screen when pressed on back button
      if (history.location.pathname === `${match.url}/${ROUTES.CHATS}`) {
        // Then kill app
        return false
      }

      // If user not in chat list screen when pressed back button
      history.location.pathname !== `${match.url}/${ROUTES.CHATS}` &&
        // navigate to chat list screen
        this.onScrollToIndex(`${match.url}/${ROUTES.CHATS}`),
        history.replace(`${match.url}/${ROUTES.CHATS}`)
      return true
    })
  }

  componentWillUnmount() {
    this.backHandler.remove()
  }

  RenderScreen = ({ item }) => {
    const { firebase, history } = this.props
    // const linkedPage = pages[match.params.screenId]

    // if (this.anim !== linkedPage.index) {
    //   this.anim < linkedPage.index
    //     ? (Animated.timing(this.anim, {
    //         toValue: this.anim + 1,
    //         duration: 1000,
    //         useNativeDriver: true
    //       }).start(),
    //       this.anim.setValue(this.anim++))
    //     : (Animated.timing(this.anim, {
    //         toValue: this.anim - 1,
    //         duration: 1000,
    //         useNativeDriver: true
    //       }).start(),
    //       this.anim.setValue(this.anim--))
    // }

    // HEADER BAR TITLE ON THE LEFT
    const leftComponent = title => ({
      text: title.toUpperCase(),
      style: [styles.title, styles.color]
    })

    // HEADER BAR ICON ON THE RIGHT
    const rightComponent = (name, onPress) => (
      <TouchableOpacity
        onPress={() => onPress(history, firebase)}
        style={styles.buttonStyle}>
        <Entypo name={name} {...iconStyle} />
      </TouchableOpacity>
    )

    // Component to render
    const Component = item.component
    // const opacityScale = this.anim.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [0, 1]
    // })
    // const translateScale = this.anim.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [-SCREEN_WIDTH, 0]
    // })
    let transformStyle = {
      ...styles.container,
      width
      // opacity: opacityScale,
      // transform: [{ translateX: translateScale }]
    }

    return (
      <View style={transformStyle}>
        <Header
          placement="left"
          containerStyle={styles.topBarContainer}
          // centerContainerStyle={styles.centerContainer}
          leftComponent={leftComponent(item.title)}
          rightComponent={rightComponent(item.icon, item.onPress)}
        />
        <Component {...this.props} />
      </View>
    )
  }

  onViewableItemsChanged = ({ viewableItems, changed }) => {
    // console.log('Visible items are', viewableItems)
    // console.log('Changed in this iteration', changed)
  }
  viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  }

  onScrollToIndex = (path, animated = true) => {
    const index = screensIndex[path]

    // console.log(screensIndex[index])

    this.flatListRef.scrollToIndex({
      index: index,
      animated: animated
    })
  }

  render() {
    const { match, history, location } = this.props

    // if (history.length > 1) {
    //   history.entries.pop(history.length)
    //   history.index = history.length - 1
    // }
    // else if (
    //   location.pathname === `${match.path}/${ROUTES.CHATS}` &&
    //   history.length !== 1
    // ) {
    //   history.entries.pop()
    //   history.index = 0
    // }
    // console.log('history ,', history)
    // console.log('location ,', location)

    return (
      <View style={styles.container}>
        <View style={styles.screen}>
          <Switch>
            <Redirect
              exact
              from={match.path}
              to={`${match.path}/${ROUTES.CHATS}`}
            />
          </Switch>

          <FlatList
            data={screens}
            extraData={this.state}
            ref={ref => {
              this.flatListRef = ref
            }}
            // onScrollToIndexFailed={() => {}}
            horizontal
            pagingEnabled
            viewabilityConfig={this.viewabilityConfig}
            onViewableItemsChanged={this.onViewableItemsChanged}
            keyExtractor={(item, index) => index.toString()}
            renderItem={this.RenderScreen}
          />

          {/* <Switch>
            <Redirect
              exact
              from={match.path}
              to={`${match.path}/${ROUTES.CHATS}`}
            />
            <Route
              path={`${match.path}/:screenId`}
              component={this.RenderScreen}
            />
          </Switch> */}
        </View>

        <View style={styles.bottomTabBar}>
          <TouchableWithoutFeedback
            onPress={() => {
              this.onScrollToIndex(`${match.url}/${ROUTES.CHATS}`)
              history.entries.pop()
              history.index = 0
              history.replace(`${match.url}/${ROUTES.CHATS}`)
            }}>
            <View style={styles.link}>
              <Entypo name={'chat'} {...iconStyle} />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              this.onScrollToIndex(`${match.url}/${ROUTES.CONTACTS}`)
              history.replace(`${match.url}/${ROUTES.CONTACTS}`)
            }}>
            <View style={styles.link}>
              <Entypo name={'users'} {...iconStyle} />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              this.onScrollToIndex(`${match.url}/${ROUTES.ACCOUNT}`)
              history.replace(`${match.url}/${ROUTES.ACCOUNT}`)
            }}>
            <View style={styles.link}>
              <Entypo name={'user'} {...iconStyle} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    )
  }
}

export default withAuthorization(Home)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch'
  },
  color: {
    color: '#61dafb'
  },
  topBarContainer: {
    alignItems: 'center',
    backgroundColor: '#222',
    height: '15%',
    maxHeight: 75,
    justifyContent: 'space-between',
    paddingTop: 45,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
    width: '100%'
  },
  buttonStyle: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    paddingRight: 5,
    width: 40
  },
  screen: {
    flex: 1
  },
  link: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomTabBar: {
    height: '15%',
    maxHeight: 75,
    flexDirection: 'row',
    backgroundColor: '#222',
    padding: 20,
    width: '100%'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20
  }
})
