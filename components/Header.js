import React, { PureComponent } from "react";
import { Text, View, StyleSheet } from "react-native";

export class Header extends PureComponent {
  render() {
    return (
      <View style={styles.title}>
        <Text>{this.props.title}</Text>
      </View>
    );
  }
}

export default Header;

const styles = StyleSheet.create({
  title: {
    backgroundColor: "green",
    height: 75,
    justifyContent: "flex-end",
    paddingBottom: 10
  }
});
