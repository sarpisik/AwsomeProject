import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
  StatusBar
} from "react-native";
import { Font } from "expo";
import * as ROUTES from "../../constants";
import Button from "../../Button";

const SCREEN_WIDTH = Dimensions.get("window").width;

const IMAGE_SIZE = SCREEN_WIDTH - 80;

export default class Account extends Component {
  constructor(props) {
    super(props);
    const { authUser } = props;

    this.state = {
      fontLoaded: false,
      creationTime: new Date(authUser.creationTime).toUTCString()
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      regular: require("../../../assets/fonts/Montserrat-Regular.ttf"),
      light: require("../../../assets/fonts/Montserrat-Light.ttf"),
      bold: require("../../../assets/fonts/Montserrat-Bold.ttf")
    });

    this.setState({ fontLoaded: true });
  }

  onSignOut = () => {
    const { firebase, history } = this.props;

    firebase.doSignOut().then(() => {
      // REDIRECT TO HOME
      history.entries = [];
      history.index = -1;

      history.push(`/${ROUTES.AUTH}`);
    });
  };

  render() {
    const { authUser } = this.props;
    const { creationTime } = this.state;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        {this.state.fontLoaded ? (
          <View style={{ flex: 1, backgroundColor: "rgba(47,44,60,1)" }}>
            <ScrollView style={{ flex: 1 }}>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Image
                  source={authUser.photoURL}
                  style={{
                    width: IMAGE_SIZE,
                    height: IMAGE_SIZE,
                    borderRadius: 10
                  }}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  marginTop: 20,
                  marginHorizontal: 40,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 26,
                    color: "white",
                    fontFamily: "bold"
                  }}
                >
                  {authUser.name}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 26,
                    color: "green",
                    fontFamily: "bold",
                    textAlign: "right"
                  }}
                >
                  84%
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  marginTop: 20,
                  width: SCREEN_WIDTH - 80,
                  marginLeft: 40
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: "white",
                    fontFamily: "regular"
                  }}
                >
                  {authUser.description || "No description"}
                </Text>
              </View>
              <View style={{ flex: 1, marginTop: 30 }}>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: "rgba(216, 121, 112, 1)",
                    fontFamily: "regular",
                    marginLeft: 40
                  }}
                >
                  INFO
                </Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    marginTop: 20,
                    marginHorizontal: 30
                  }}
                >
                  <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoTypeLabel}>Email</Text>
                      <Text style={styles.infoTypeLabel}>Creation Time</Text>
                      <Text style={styles.infoTypeLabel}>Phone</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.infoAnswerLabel}>
                        {authUser.email}
                      </Text>
                      <Text style={styles.infoAnswerLabel}>{creationTime}</Text>
                      <Text style={styles.infoAnswerLabel}>
                        {authUser.phoneNumber}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Button
                title="Change Password"
                onPress={() => console.log("Not configured yet")}
              />
              <Button
                title="Reset Password"
                onPress={() => console.log("Not configured yet")}
              />
              <Button title="Sign Out" onPress={this.onSignOut} />
            </ScrollView>
          </View>
        ) : (
          <Text>Loading...</Text>
        )}
      </SafeAreaView>
    );
  }
}

Account.propTypes = {
  authUser: PropTypes.object.isRequired,
  firebase: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  statusBar: {
    height: 10
  },
  navBar: {
    height: 60,
    width: SCREEN_WIDTH,
    justifyContent: "center"
  },
  nameHeader: {
    color: "white",
    fontSize: 22,
    textAlign: "center",
    alignContent: "center"
  },
  infoTypeLabel: {
    fontSize: 15,
    textAlign: "right",
    color: "rgba(126,123,138,1)",
    fontFamily: "regular",
    paddingBottom: 10
  },
  infoAnswerLabel: {
    fontSize: 15,
    color: "white",
    fontFamily: "regular",
    paddingBottom: 10
  }
});

// const Account = ({ firebase, authUser }) => {
//   return (
//     <View>
//       <AccountDetails authUser={authUser} firebase={firebase} />
//       <SignOut />
//     </View>
//   );
// };
