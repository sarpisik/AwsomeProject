import React, { PureComponent } from 'react'
import {
  FlatList,
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
import ChatList from './ChatsScreen'
import Account from './Account'

const { width } = Dimensions.get('window')

const iconStyle = {
  color: '#61dafb',
  size: 25
}

// Screens to render in FlatList
const screens = [
  {
    component: ChatList,
    title: 'Chats',
    icon: 'new-message',
    path: ROUTES.MAIN,
    onPress: history =>
      history.push(`${ROUTES.MAIN}${ROUTES.ADD_NEW_CONTACT_SCREEN}`)
  },
  {
    component: Contacts,
    title: 'Contacts',
    icon: 'add-user',
    path: `${ROUTES.MAIN}${ROUTES.CONTACTS}`,
    onPress: history =>
      history.push(`${ROUTES.MAIN}${ROUTES.ADD_NEW_CONTACT_SCREEN}`)
  },
  {
    component: Account,
    title: 'Account',
    icon: 'log-out',
    path: `${ROUTES.MAIN}${ROUTES.ACCOUNT}`,
    onPress: (history, firebase) => {
      firebase.doSignOut().then(() => {
        history.entries = []
        history.index = -1

        history.push(ROUTES.AUTH)
      })
    }
  }
]

export class Home extends PureComponent {
  constructor(props) {
    super(props)

    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 50
    }

    this.state = {
      authUser: null,
      history: null
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { authUser, history } = props

    // If the async data changed or history of navigation changed...
    if (authUser !== state.authUser || history !== state.history) {
      // Then update state
      return {
        authUser
      }
    }
    return null
  }

  componentDidMount() {
    const { match, history } = this.props
    console.log('Home mounted')

    // Avoid scroll failed
    history.location.pathname !== match.path &&
      setTimeout(() => {
        this.onScrollToIndex(0, false)
      }, 100)

    // Prevent navigate back for android devices on back button press
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // If user in chat list screen when pressed on back button
      if (history.location.pathname === match.path) {
        // Then kill app
        return false
      }

      // If user not in chat list screen when pressed back button
      history.location.pathname !== match.path &&
        // navigate to chat list screen
        this.onScrollToIndex(0)
      return true
    })
  }

  componentWillUnmount() {
    console.log('Home unmounted')
    this.backHandler.remove()
  }

  RenderScreen = ({ item }) => {
    const { firebase, history } = this.props

    // Screen title on the left
    const leftComponent = title => ({
      text: title.toUpperCase(),
      style: [styles.title, styles.color]
    })

    // Touchable Icon on the right
    const rightComponent = (name, onPress) => (
      <TouchableOpacity
        onPress={() => onPress(history, firebase)}
        style={styles.buttonStyle}>
        <Entypo name={name} {...iconStyle} />
      </TouchableOpacity>
    )

    // Component to render
    const Component = item.component

    const transformStyle = {
      ...styles.container,
      width
    }

    return (
      <View style={transformStyle}>
        <Header
          placement="left"
          containerStyle={styles.topBarContainer}
          leftComponent={leftComponent(item.title)}
          rightComponent={rightComponent(item.icon, item.onPress)}
        />
        <Component {...this.props} />
      </View>
    )
  }

  onViewableItemsChanged = ({ viewableItems }) => {
    const { history } = this.props
    const {
      index,
      item: { path }
    } = viewableItems[0]
    index == 0 && history.entries.pop(), (history.index = 0)

    // Update history entries on navigation
    history.replace(path)
  }

  onScrollToIndex = (index, animated = true) => {
    // Scroll screen on swipe or on touched bottom navbar
    this.flatListRef.scrollToIndex({
      index: index,
      animated: animated
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.screen}>
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
        </View>

        <View style={styles.bottomTabBar}>
          <TouchableWithoutFeedback onPress={() => this.onScrollToIndex(0)}>
            <View style={styles.link}>
              <Entypo name={'chat'} {...iconStyle} />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.onScrollToIndex(1)}>
            <View style={styles.link}>
              <Entypo name={'users'} {...iconStyle} />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.onScrollToIndex(2)}>
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
