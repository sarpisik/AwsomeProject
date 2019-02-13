import React, { PureComponent } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Button } from "react-native-elements";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default class CustomButton extends PureComponent {
  render() {
    const { title, onPress, ...restProps } = this.props;

    return (
      <Button
        containerStyle={styles.container}
        style={styles.subContainer}
        buttonStyle={styles.button}
        // linearGradientProps={{
        //   colors: ["rgb(97, 218, 251)", "rgb(0, 0, 128)"],
        //   start: [1, 0],
        //   end: [0.2, 0]
        // }}
        title={title}
        titleStyle={styles.title}
        onPress={onPress}
        activeOpacity={0.5}
        loadingProps={styles.loading}
        {...restProps}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: { marginVertical: 20 },
  subContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  button: {
    height: 40,
    width: SCREEN_WIDTH - 40,
    borderRadius: 30,
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#222"
  },
  title: {
    fontFamily: "regular",
    fontSize: 20,
    color: "#61dafb",
    textAlign: "center"
  },
  loading: {
    color: "#61dafb"
  }
});
