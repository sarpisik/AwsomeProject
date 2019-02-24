import React from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native'

export default () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="rgb(97, 218, 251)" />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
