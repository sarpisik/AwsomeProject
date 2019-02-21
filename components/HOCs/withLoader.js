import React, { PureComponent } from 'react'
import { View } from 'react-native'
import Loading from '../Loading'
import { Fade } from '../Animations'

const withLoader = Component => {
  class WithLoader extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        isLoadComplete: false,
        isContactsLoadComplete: false,
        isChatsLoadComplete: false
      }
    }

    componentDidMount = () => {
      console.log('WithLoader mounted')
    }

    componentWillUnmount = () => {
      console.log('WithLoader unMounted')
    }

    onChange = obj => this.setState(obj)

    onShutLoader = () => this.setState({ isLoadComplete: true })

    render() {
      const { isLoadComplete } = this.state

      return (
        <View style={{ flex: 1 }}>
          <Fade
            style={{
              position: 'absolute',
              top: 0,
              start: 0,
              right: 0,
              bottom: 0
            }}
            visible={!isLoadComplete}>
            <Loading />
          </Fade>
          <Component {...this.props} {...this.state} onLoader={this.onChange} />
        </View>
      )
    }
  }

  return WithLoader
}

export default withLoader
