import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { Animated, Easing, Dimensions, StyleSheet } from 'react-native'

const { width } = Dimensions.get('window')

export default class TransLeft extends PureComponent {
  static defaultProps = {
    duration: 300,
    width: width,
    reverse: 1
  }
  static propTypes = {
    duration: PropTypes.number,
    width: PropTypes.number,
    reverse: PropTypes.number
  }
  constructor(props) {
    super(props)
    this.state = {
      visible: props.visible
    }
  }

  componentWillMount() {
    this._visibility = new Animated.Value(this.props.visible ? 1 : 0)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({ visible: true })
    }
    Animated.timing(this._visibility, {
      toValue: nextProps.visible ? 1 : 0,
      duration: nextProps.duration,
      useNativeDriver: true
      // easing: Easing.bezier(0.17, 0.67, 0.83, 0.67)
    }).start(() => {
      this.setState({ visible: nextProps.visible })
    })
  }

  render() {
    const { visible, children, width, reverse, ...rest } = this.props

    const containerStyle = {
      // opacity: this._visibility.interpolate({
      //   inputRange: [0, 1],
      //   outputRange: [0, 1]
      // }),
      transform: [
        {
          translateX: this._visibility.interpolate({
            inputRange: [0, 1],
            outputRange: [width * reverse, 0]
          })
        }
      ]
    }

    const combinedStyle = [containerStyle, styles.container]
    return (
      <Animated.View
        style={this.state.visible ? combinedStyle : containerStyle}
        {...rest}>
        {this.state.visible ? children : null}
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    start: 0,
    right: 0,
    bottom: 0
  }
})
