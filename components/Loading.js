import React, { PureComponent } from 'react'
import { StyleSheet, View, Animated } from 'react-native'

export default () => (
  <View style={styles.container}>
    <LoaderBall index={0} />
    <LoaderBall index={1} />
    <LoaderBall index={2} />
  </View>
)

class LoaderBall extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loadAnim: new Animated.Value(0)
    }
  }

  componentDidMount = () => {
    Animated.loop(
      Animated.timing(this.state.loadAnim, {
        toValue: 1,
        duration: 900,
        delay: this.props.index * 250,
        useNativeDriver: true
      })
    ).start()
  }

  render() {
    const ballScale = this.state.loadAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0.5]
    })
    const opacityScale = this.state.loadAnim.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 1, 0.5]
    })

    let transformStyle = {
      ...styles.loaderBall,
      opacity: opacityScale,
      transform: [{ scale: ballScale }]
    }

    return <Animated.View style={transformStyle} />
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loaderBall: {
    marginHorizontal: 4,
    height: 32,
    width: 32,
    borderRadius: 8,
    backgroundColor: 'rgb(97, 218, 251)'
  }
})
