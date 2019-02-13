import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

export default function List({
  title,
  subTitle,
  image,
  date,
  read = { color: "black" },
  line = 99
}) {
  return (
    <View style={styles.row}>
      {/* Profile Photo */}
      <Image style={styles.avatar} source={image} />

      {/* Chat */}
      <View style={styles.rowText}>
        <View style={styles.senderRow}>
          {/* Contact Name */}
          <Text style={styles.sender}>{title}</Text>

          {/* Sent Time */}
          <Text style={styles.sender}>{date}</Text>
        </View>

        {/* Latest Text */}
        <Text numberOfLines={line} style={[styles.message, read]}>
          {subTitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#61dafb"
  },
  avatar: {
    borderRadius: 20,
    width: 40,
    height: 40,
    marginRight: 10
  },
  rowText: {
    flex: 1
  },
  message: {
    fontSize: 18
  },

  senderRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sender: {
    fontWeight: "bold",
    paddingRight: 10
  }
});
