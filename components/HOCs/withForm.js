import React, { PureComponent } from 'react'

const withForm = propState => Component => {
  class WithForm extends PureComponent {
    constructor(props) {
      super(props)

      this.state = {
        ...propState
      }
    }

    onChange = obj => this.setState(obj)

    onSubmit = () => this.setState({ ...propState })

    render() {
      return (
        <Component
          {...this.props}
          {...this.state}
          onChange={this.onChange}
          onSubmit={this.onSubmit}
        />
      )
    }
  }

  return WithForm
}

export default withForm
