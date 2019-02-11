import React, { PureComponent } from "react";
import { Dimensions } from "react-native";
import { Button } from "react-native-elements";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default class CustomButton extends PureComponent {
  render() {
    const { title, onPress } = this.props;

    return (
      <Button
        containerStyle={{ marginVertical: 20 }}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
        buttonStyle={{
          height: 40,
          width: SCREEN_WIDTH - 40,
          borderRadius: 30,
          justifyContent: "center",
          alignSelf: "center"
        }}
        linearGradientProps={{
          colors: ["rgba(214,116,112,1)", "rgba(233,174,87,1)"],
          start: [1, 0],
          end: [0.2, 0]
        }}
        title={title}
        titleStyle={{
          fontFamily: "regular",
          fontSize: 20,
          color: "white",
          textAlign: "center"
        }}
        onPress={onPress}
        activeOpacity={0.5}
      />
    );
  }
}
