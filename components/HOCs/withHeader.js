import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { TouchableOpacity, View } from 'react-native'
import { withRouter } from 'react-router-native'

import { Header } from 'react-native-elements'
import { Entypo } from '@expo/vector-icons'

const colors = {
  text: '#61dafb',
  background: '#222'
}

const iconStyle = {
  color: colors.text,
  size: 25
}

const containerStyle = {
  alignItems: 'center',
  backgroundColor: colors.background,
  borderBottomColor: colors.background,
  height: '15%',
  maxHeight: 75,
  justifyContent: 'center',
  paddingHorizontal: 0,
  paddingTop: 25,
  width: '100%'
}

const centerContainerStyle = { paddingRight: 20 }

const buttonStyle = {
  alignItems: 'center',
  height: 48,
  justifyContent: 'center',
  paddingRight: 5,
  width: 40
}

const textStyle = {
  color: colors.text,
  fontWeight: 'bold',
  fontSize: 20
}

class TopHeader extends PureComponent {
  goBack = () => this.props.history.goBack()

  horizontalComponent = (name, onPress) => (
    <TouchableOpacity onPress={onPress} style={buttonStyle}>
      <Entypo name={name} {...iconStyle} />
    </TouchableOpacity>
  )

  centerComponent = title => ({
    text: title.toUpperCase(),
    style: textStyle
  })

  render() {
    const { title } = this.props
    return (
      <Header
        containerStyle={containerStyle}
        centerContainerStyle={centerContainerStyle}
        leftComponent={this.horizontalComponent('chevron-left', this.goBack)}
        centerComponent={this.centerComponent(title)}
      />
    )
  }
}

export default TopHeader

export const withHeader = ({ title = '' }) => WrappedComponent => {
  class WithHeader extends PureComponent {
    goBack = () => this.props.history.goBack()

    horizontalComponent = (name, onPress) => (
      <TouchableOpacity onPress={onPress} style={buttonStyle}>
        <Entypo name={name} {...iconStyle} />
      </TouchableOpacity>
    )

    centerComponent = title => ({
      text: title.toUpperCase(),
      style: textStyle
    })

    render() {
      return (
        <View style={{ flex: 1 }}>
          <Header
            containerStyle={containerStyle}
            centerContainerStyle={centerContainerStyle}
            leftComponent={this.horizontalComponent(
              'chevron-left',
              this.goBack
            )}
            centerComponent={this.centerComponent(title)}
          />
          <WrappedComponent {...this.props} />
        </View>
      )
    }
  }
  return withRouter(WithHeader)
}

withHeader.propTypes = {
  title: PropTypes.string.isRequired
}
