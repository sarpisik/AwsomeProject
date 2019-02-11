import React, { Component } from "react";
import { Route, Link, Switch, Redirect } from "react-router-native";
import { StyleSheet, Text, View } from "react-native";
import { withAuthorization } from "../Session";
import * as ROUTES from "../constants";

import { Header } from "react-native-elements";
import Contacts from "./ContactsScreen";
import Chats from "./ChatsScreen";
import Account from "./Account";

// Links for lazy load pages
const pages = {
  [ROUTES.CHATS]: {
    component: Chats,
    title: "Chats List"
  },
  [ROUTES.CONTACTS]: {
    component: Contacts,
    title: "Contacts List"
  },
  [ROUTES.ACCOUNT]: {
    component: Account,
    title: "Account Details"
  }
};

// Run page by referred link
const Page = ({ match }) => {
  const Component = withAuthorization(pages[match.params.screenId].component);

  const centerComponent = title => ({
    text: title.toUpperCase(),
    style: styles.title
  });

  return (
    <View style={styles.container}>
      <Header
        containerStyle={styles.topBarContainer}
        centerContainerStyle={styles.centerContainer}
        centerComponent={centerComponent(pages[match.params.screenId].title)}
      />
      <Component />
    </View>
  );
};

export class Home extends Component {
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
            <Route path={`${match.path}/:screenId`} component={Page} />
          </Switch>
        </View>

        <View style={[styles.bottomTabBar, styles.bar]}>
          <Link style={styles.link} to={`${match.url}/${ROUTES.CHATS}`}>
            <Text>Chat</Text>
          </Link>

          <Link style={styles.link} to={`${match.url}/${ROUTES.CONTACTS}`}>
            <Text>Contacts</Text>
          </Link>

          <Link style={styles.link} to={`${match.url}/${ROUTES.ACCOUNT}`}>
            <Text> Account </Text>
          </Link>
        </View>
      </View>
    );
  }
}

export default Home;

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "yellow",
    flex: 1,
    alignItems: "stretch"
  },
  topBarContainer: {
    alignItems: "center",
    height: "15%",
    maxHeight: 75,
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingTop: 25,
    width: "100%"
  },
  centerContainer: {
    paddingRight: 20
  },
  screen: {
    flex: 1
    // backgroundColor: 'blue',
  },
  link: {
    justifyContent: "center"
  },
  bar: {
    height: 55,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-around"
  },
  bottomTabBar: {
    backgroundColor: "red"
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20
  }
});
