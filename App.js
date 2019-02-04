import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
import {
  createBottomTabNavigator,
  createStackNavigator,
  createAppContainer,
  createSwitchNavigator
} from "react-navigation";
import Firebase, { FirebaseContext } from './components/Firebase';
import { withAuthentication } from './components/Auth/Session';
import Contacts, {ContactScreen, AddNewContactScreen} from './components/ContactsScreen';
import Chats, {ChatScreen} from './components/ChatsScreen';
import Account from './components/Account';
import { SignUpScreen, SignInScreen } from './components/Auth';

const topBarStyle = {
  headerStyle: {
    backgroundColor: '#f4511e',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

// Bottom TabBar Menu
const TabNavigator = createBottomTabNavigator({
  CHATS: Chats,
  CONTACTS: Contacts, // ContactList & AddNewContactScreen
  ACCOUNT: Account,
});

TabNavigator.navigationOptions = ({ navigation }) => {
  const { routeName } = navigation.state.routes[navigation.state.index];

  // You can do whatever you like here to pick the title based on the route name
  const headerTitle = routeName;

  return {
    headerTitle,
  };
};

const AppStack = createStackNavigator(
  {
    Home: TabNavigator, // Bottom TabBar
    ChatScreen: ChatScreen, // Chat screen with a contact
    ContactScreen: ContactScreen, // Contact details
    AddNewContactScreen: AddNewContactScreen, // Add a new contact
  },
  {
    // initialRouteName: "Chats",
    // initialRouteParams: 'denem',
    defaultNavigationOptions: {
      ...topBarStyle,
    }
  }
);

const AuthStack = createStackNavigator(
  {
    SignIn: {
      screen: SignInScreen,
      navigationOptions: () => ({
      title: 'Sign In',
      headerBackTitle: null
    }),
    },
    SignUp: {
      screen: SignUpScreen,
      navigationOptions: () => ({
      title: 'Sign Up',
      headerBackTitle: null
    }),
    },
  },
  {
    initialRouteName: "SignIn",
    defaultNavigationOptions: {
      ...topBarStyle,
    }
  }
);

const AppContainerBase = createAppContainer(createSwitchNavigator(
  {
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: "App",
  },
));

const AppContainer = withAuthentication(AppContainerBase);

export default class App extends React.Component {
  render() {
    return (
      <FirebaseContext.Provider value={ new Firebase()}>
        <AppContainer />
      </FirebaseContext.Provider>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: 'red',
  },
});
