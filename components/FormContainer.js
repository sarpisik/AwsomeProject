import React, { PureComponent } from 'react'
import {
  Dimensions,
  UIManager,
  KeyboardAvoidingView,
  StyleSheet,
  ScrollView,
  Text,
  View
} from 'react-native'
import { Input } from 'react-native-elements'
import Button from './Button'

import { Font } from 'expo'

import Icon from 'react-native-vector-icons/SimpleLineIcons'

// Enable LayoutAnimation on Android
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true)

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

const FormInput = props => {
  const { icon, refInput, ...otherProps } = props
  return (
    <Input
      {...otherProps}
      ref={refInput}
      inputContainerStyle={styles.inputContainer}
      leftIcon={<Icon name={icon} color="#61dafb" size={18} />}
      inputStyle={styles.inputStyle}
      autoFocus={false}
      autoCapitalize="none"
      keyboardAppearance="dark"
      errorStyle={styles.errorInputStyle}
      autoCorrect={false}
      blurOnSubmit={false}
      placeholderTextColor="#61dafb"
    />
  )
}

export default class FormContainer extends PureComponent {
  constructor(props) {
    super(props)

    this.state = { fontLoaded: false }
  }
  async componentDidMount() {
    await Font.loadAsync({
      regular: require('../assets/fonts/Montserrat-Regular.ttf'),
      light: require('../assets/fonts/Montserrat-Light.ttf'),
      bold: require('../assets/fonts/Montserrat-Bold.ttf')
    })

    this.setState({ fontLoaded: true })
  }

  onRenderInputField = list => {
    return list.map((input, i) => <FormInput key={i} {...input} />)
  }
  render() {
    const {
      inputList,
      buttonTitle,
      isLoading,
      isInvalid,
      onSubmit
    } = this.props
    const { fontLoaded } = this.state
    return !fontLoaded ? (
      <View>
        <Text> Loading... </Text>
      </View>
    ) : (
      <ScrollView
        scrollEnabled={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}>
        <KeyboardAvoidingView
          behavior="position"
          contentContainerStyle={styles.formContainer}>
          {/* INPUT FIELDS */}
          <View style={{ width: '80%', alignItems: 'center' }}>
            {this.onRenderInputField(inputList)}
          </View>

          {/* SUBMIT BUTTON */}
          <Button
            loading={isLoading}
            title={buttonTitle}
            containerStyle={{ marginVertical: 25 }}
            onPress={onSubmit}
            disabled={isInvalid}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 20,
    backgroundColor: '#293046',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputContainer: {
    paddingLeft: 8,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#61dafb',
    height: 45,
    marginVertical: 10
  },
  inputStyle: {
    flex: 1,
    marginLeft: 10,
    color: '#61dafb',
    fontFamily: 'light',
    fontSize: 16
  },
  errorInputStyle: {
    marginTop: 0,
    textAlign: 'center',
    color: '#F44336'
  }
})
