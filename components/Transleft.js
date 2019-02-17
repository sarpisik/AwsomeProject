import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { Animated, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

export default class TransLeft extends PureComponent {
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
    const { visible, style, children, ...rest } = this.props

    const containerStyle = {
      opacity: this._visibility.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
      }),
      transform: [
        {
          translateX: this._visibility.interpolate({
            inputRange: [0, 1],
            outputRange: [width, 0]
          })
        }
      ]
    }

    const combinedStyle = [containerStyle, style, { width }]
    return (
      <Animated.View
        style={this.state.visible ? combinedStyle : containerStyle}
        {...rest}>
        {this.state.visible ? children : null}
      </Animated.View>
    )
  }
}
