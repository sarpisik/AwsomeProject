import React, { PureComponent } from 'react'
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
  View,
  Image,
  ScrollView,
  Dimensions
} from 'react-native'
import { Font } from 'expo'

import Loading from './Loading'

const SCREEN_WIDTH = Dimensions.get('window').width

const IMAGE_SIZE = SCREEN_WIDTH - 80

export const Info = ({ description, email, creationTime, phone }) => {
  return (
    <>
      {/* DESCRIPTION */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* INFO */}
      <View style={styles.infoContainer}>
        {/* TITLE */}
        <Text style={styles.infoTitle}>INFO</Text>
        <View style={styles.infoSubContainer}>
          <View style={styles.rowLine}>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTypeLabel}>Email</Text>
              <Text style={styles.infoTypeLabel}>Creation Time</Text>
              <Text style={styles.infoTypeLabel}>Phone</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoAnswerLabel}>{email}</Text>
              <Text style={styles.infoAnswerLabel}>{creationTime}</Text>
              <Text style={styles.infoAnswerLabel}>{phone}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  )
}

export default class Profile extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      fontLoaded: false
    }
  }

  async componentDidMount() {
    this.mounted = true
    await Font.loadAsync({
      regular: require('../assets/fonts/Montserrat-Regular.ttf'),
      light: require('../assets/fonts/Montserrat-Light.ttf'),
      bold: require('../assets/fonts/Montserrat-Bold.ttf')
    })

    this.mounted && this.setState({ fontLoaded: true })
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  render() {
    const { imageURL, userName, status } = this.props
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        {this.state.fontLoaded ? (
          <View style={styles.container}>
            <ScrollView style={{ flex: 1 }}>
              {/* PROFILE PHOTO */}
              <View style={styles.imageContainer}>
                <Image
                  source={imageURL || require('../assets/profile_picture.png')}
                  style={styles.image}
                />
              </View>

              {/* NAME & STATUS/REQUEST */}
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{userName}</Text>
                <Text style={[styles.name, { textAlign: 'right' }]}>
                  {status}
                </Text>
              </View>
              {this.props.children}
            </ScrollView>
          </View>
        ) : (
          <Loading />
        )}
      </SafeAreaView>
    )
  }
  static defaultProps = {
    stranger: false
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#333' },
  imageContainer: { justifyContent: 'center', alignItems: 'center' },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 10
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  name: {
    flex: 1,
    fontSize: 26,
    color: '#61dafb',
    fontFamily: 'bold'
  },
  descriptionContainer: {
    flex: 1,
    marginTop: 20,
    width: SCREEN_WIDTH - 80,
    marginLeft: 40
  },
  description: {
    flex: 1,
    fontSize: 15,
    color: 'white',
    fontFamily: 'regular'
  },
  infoContainer: { flex: 1, marginTop: 30 },
  infoTitle: {
    flex: 1,
    fontSize: 15,
    color: '#61dafb',
    fontFamily: 'regular',
    marginLeft: 40
  },
  infoSubContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 30
  },
  rowLine: { flex: 1, flexDirection: 'row' },
  infoTypeLabel: {
    fontSize: 15,
    textAlign: 'right',
    color: '#61dafb',
    fontFamily: 'regular',
    paddingBottom: 10
  },
  infoAnswerLabel: {
    fontSize: 15,
    color: 'white',
    fontFamily: 'regular',
    paddingBottom: 10
  }
})
