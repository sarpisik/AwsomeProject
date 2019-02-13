import React, { Component } from "react";
import { Route, Link, Switch, Redirect } from "react-router-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { withAuthorization } from "../Session";
import * as ROUTES from "../constants";

import { Header } from "react-native-elements";
import { Entypo } from "@expo/vector-icons";
import Contacts from "./ContactsScreen";
import Chats from "./ChatsScreen";
import Account from "./Account";

const iconStyle = {
  color: "#61dafb",
  size: 25
};

// Links for lazy load pages
const pages = {
  [ROUTES.CHATS]: {
    component: Chats,
    title: "Chats",
    icon: "new-message",
    onPress: history => history.push(`/${ROUTES.ADD_NEW_CONTACT_SCREEN}`)
  },
  [ROUTES.CONTACTS]: {
    component: Contacts,
    title: "Contacts",
    icon: "add-user",
    onPress: history => history.push(`/${ROUTES.ADD_NEW_CONTACT_SCREEN}`)
  },
  [ROUTES.ACCOUNT]: {
    component: Account,
    title: "Account",
    icon: "log-out",
    onPress: (history, firebase) => {
      firebase.doSignOut().then(() => {
        history.entries = [];
        history.index = -1;

        history.push(`/${ROUTES.AUTH}`);
      });
    }
  }
};

// Run page by referred link

export class Home extends Component {
  RenderScreen = ({ match }) => {
    const { firebase, history } = this.props;
    const linkedPage = pages[match.params.screenId];

    // HEADER BAR TITLE ON THE LEFT
    const leftComponent = title => ({
      text: title.toUpperCase(),
      style: [styles.title, styles.color]
    });

    // HEADER BAR ICON ON THE RIGHT
    const rightComponent = (name, onPress) => (
      <TouchableOpacity
        onPress={() => onPress(history, firebase)}
        style={styles.buttonStyle}
      >
        <Entypo name={name} {...iconStyle} />
      </TouchableOpacity>
    );

    // Component to render
    const Component = linkedPage.component;

    return (
      <View style={styles.container}>
        <Header
          placement="left"
          containerStyle={styles.topBarContainer}
          // centerContainerStyle={styles.centerContainer}
          leftComponent={leftComponent(linkedPage.title)}
          rightComponent={rightComponent(linkedPage.icon, linkedPage.onPress)}
        />
        <Component {...this.props} />
      </View>
    );
  };

  render() {
    const { match } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.screen}>
          <Switch>
            <Redirect
              exact
              from={match.path}
              to={`${match.path}/${ROUTES.CHATS}`}
            />
            {/* <Route path={`${match.path}`} component={Chats} /> */}
            <Route
              path={`${match.path}/:screenId`}
              component={this.RenderScreen}
            />
          </Switch>
        </View>

        <View style={styles.bottomTabBar}>
          <Link replace style={styles.link} to={`${match.url}/${ROUTES.CHATS}`}>
            {/* <Text style={styles.textLink}>Chat</Text> */}
            <Entypo name={"chat"} {...iconStyle} />
          </Link>

          <Link
            replace
            style={styles.link}
            to={`${match.url}/${ROUTES.CONTACTS}`}
          >
            {/* <Text style={styles.textLink}>Contacts</Text> */}
            <Entypo name={"users"} {...iconStyle} />
          </Link>

          <Link
            replace
            style={styles.link}
            to={`${match.url}/${ROUTES.ACCOUNT}`}
          >
            {/* <Text style={styles.textLink}> Account </Text> */}
            <Entypo name={"user"} {...iconStyle} />
          </Link>
        </View>
      </View>
    );
  }
}

export default withAuthorization(Home);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch"
  },
  color: {
    color: "#61dafb"
  },
  topBarContainer: {
    alignItems: "center",
    backgroundColor: "#222",
    height: "15%",
    maxHeight: 75,
    justifyContent: "space-between",
    paddingTop: 45,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
    width: "100%"
  },
  buttonStyle: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    paddingRight: 5,
    width: 40
  },
  screen: {
    flex: 1
  },
  link: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  bottomTabBar: {
    height: "15%",
    maxHeight: 75,
    flexDirection: "row",
    backgroundColor: "#222",
    padding: 20,
    width: "100%"
  },
  title: {
    fontWeight: "bold",
    fontSize: 20
  }
});
