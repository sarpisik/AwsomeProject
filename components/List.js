import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { Badge } from "react-native-elements";

export default function List({
  title,
  subTitle,
  image,
  date,
  fontStyle = { fontStyle: "italic" },
  read = { color: "black" },
  line = 99,
  badge
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

        <View style={styles.senderRow}>
          {/* Latest Text */}
          <Text numberOfLines={line} style={[styles.message, read, fontStyle]}>
            {subTitle}
          </Text>
          {badge > 0 && (
            <Badge
              containerStyle={styles.badgeContainer}
              badgeStyle={styles.badgeStyle}
              textStyle={styles.badgeText}
              value={badge}
              status="error"
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222"
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
    justifyContent: "space-between",
    alignItems: "center"
  },
  sender: {
    fontWeight: "bold",
    paddingRight: 10
  },
  badgeContainer: { paddingRight: 10 },
  badgeStyle: {
    backgroundColor: "#61dafb"
  },
  badgeText: {
    fontWeight: "bold",
    color: "#222"
  }
});
