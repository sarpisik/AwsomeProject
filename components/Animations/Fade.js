import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { Animated, StyleSheet } from 'react-native'

export default class Fade extends PureComponent {
  static defaultProps = {
    duration: 300
  }
  static propTypes = {
    duration: PropTypes.number
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
      duration: nextProps.duration
    }).start(() => {
      this.setState({ visible: nextProps.visible })
    })
  }

  render() {
    const { visible, children, ...rest } = this.props

    const containerStyle = {
      opacity: this._visibility.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
      }),
      transform: [
        {
          scale: this._visibility.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1]
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
    flex: 1
  }
})
