import React, { Component } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, View } from "react-native";
// import {
//   createBottomTabNavigator,
//   createStackNavigator,
//   createAppContainer,
//   createSwitchNavigator
// } from "react-navigation";

import {
  NativeRouter,
  Route,
  Switch,
  BackButton,
  Redirect
} from "react-router-native";
import Firebase, { FirebaseContext } from "./components/Firebase";
import { withAuthentication } from "./components/Session";
import * as ROUTES from "./components/constants";
// import Contacts, {
//   ContactScreen,
//   AddNewContactScreen
// } from "./components/ContactsScreen";
// import Chats, { ChatScreen } from "./components/ChatsSc"reen";
// import Account from "./components/Account";
// import { SignUpScreen, SignInScreen } from "./components/Auth";
import Home from "./components/Home";
import Auth from "./components/Auth";
import { ChatScreen } from "./components/Home/ChatsScreen";
import {
  ContactScreen,
  AddNewContactScreen
} from "./components/Home/ContactsScreen";

const topBarStyle = {
  headerStyle: {
    backgroundColor: "#f4511e"
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold"
  }
};

class AppContainerBase extends Component {
  render() {
    const { match } = this.props;
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
        </Switch>
      </View>
    );
  }
}

const AppContainer = withAuthentication(AppContainerBase);

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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
