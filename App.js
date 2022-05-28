import { StyleSheet, Modal, StatusBar, Text, View, Pressable, Animated, SafeAreaView, ScrollView} from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { Audio } from 'expo-av'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styled from 'styled-components/native'
import Ionicons from '@expo/vector-icons/Ionicons'
import Slider from '@react-native-community/slider'

export default function App() {
  const [recording, setRecording] = useState()
  const [recordings, setRecordings] = useState([])
  const [uriList, setUriList] = useState([])
  const [message, setMessage] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const borderRadius = useRef(new Animated.Value(50)).current
  const scale = useRef(new Animated.Value(1)).current

  const getRecordings = async () => {
    try {
      const value = await AsyncStorage.getItem('recordings')
      if(value !== null) {
        const data = await JSON.parse(value)
        setRecordings(data)
      }
    } catch(e) {
    }
  }

  useEffect(() => {
      getRecordings()
  }, [])

  useEffect(() => {
    console.log('recs: ',  recordings)
  }, [recordings])

  useEffect(() => {
    if (recording) {
      Animated.timing(scale, {
        toValue: 0.6,
        duration: 200,
        useNativeDriver: true
      }).start()
      Animated.timing(borderRadius, {
        toValue: 10,
        duration: 200,
        useNativeDriver: true
      }).start()
    } else {
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start()
      Animated.timing(borderRadius, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true
      }).start()
    }
  }, [recording])

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync()
      
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true
        })
        
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        )

        setRecording(recording)
      } else {
        setMessage('Please grant permission to access microphone', err)
      }
    } catch (err) {
      console.error('Failed to start recording', err)
    }   
  }

  const stopRecording = async () => {
    setRecording(undefined)
    try {
      await recording.stopAndUnloadAsync()
    } catch (err) {
      console.log('recording err', err)
    }

    const { sound, status } = await recording.createNewLoadedSoundAsync()

    console.log('recording saved at: ' + recording.getURI())

    const newRecordings = [...recordings, {
      sound: sound,
      duration: status.durationMillis
    }]

    await AsyncStorage.setItem('recordings', JSON.stringify(newRecordings))

    setRecordings(newRecordings)
  }

  const getDurationFormatted = (millis) => {
    console.log(millis)
    const minutes = millis / 1000 / 60
    const minutesDisplay = Math.floor(minutes)
    const seconds = Math.round((minutes - minutesDisplay) * 60)
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
    return `${minutesDisplay}:${secondsDisplay}`
  }

  const getRecordingLines = () => {
    return recordings.map((rec, index) => {
      return (
        <Recording 
          key={index} 
        >
          <RecordingTitle>Recording {index + 1} - {getDurationFormatted(rec.duration)}</RecordingTitle>
          
          <Button 
            activeOpacity={.7}
            onPress={() => rec.sound.replayAsync()}
          >
            <Ionicons name="md-play" size={32} color="white" />
          </Button>
          <Button 
            activeOpacity={.7}
            onPress={() => deleteRecording(index)}
          >
            <Ionicons name="md-trash" size={32} color="white" />
          </Button>
          <Slider
            style={{width: '100%', height: 40}}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#ddd"
            maximumTrackTintColor="#000"
            thumbTintColor='#ddd'
            onValueChange={value => {
              console.log(value)
            }}
          />
        </Recording>
      )
    })
  }

  const deleteRecording = index => {
    console.log(index)
  } 

  const clearStorage = () => {
    setRecordings([])
    AsyncStorage.clear()
  }

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Hello World!</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Hide Modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    <StatusBar translucent 
      backgroundColor="transparent"
      barStyle="light-content"
    />
      <DarkAreaView>
        <ScrollView overScrollMode='never'>
          <View>
            <Text>{message}</Text>
            {getRecordingLines()}
          </View>
        </ScrollView>
      </DarkAreaView>
      <ControlPanel>
        <RecordButtonOutline>
        <RecordButton as={Animated.TouchableOpacity} style={{ borderRadius, transform: [ { scale }]}}
          activeOpacity={.7}
          onPress={recording ? stopRecording : startRecording }
          recording={recording}
        />
        </RecordButtonOutline>
        <Pressable onPress={() => clearStorage()}>
          <Text style={{ color: 'white' }}>Reset AsyncStorage</Text>
        </Pressable>
      </ControlPanel>
    </>
  )
}

const Button = styled.TouchableOpacity`
  min-width: 60px;
  border-radius: 10px;
`


const ControlPanel = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: black;
  height: 15%;
`

const RecordButtonOutline = styled.View`

  height: 70px;
  width: 70px;
  background-color: #000;
  border-width: 5px;
  border-color: #aaa;
  border-radius: 9999px;

`

const RecordButton = styled.TouchableOpacity`
  position: absolute;
  background-color: #bb0000;
  transition: 1ms ease-in-out;
  height: 60px;
  width: 60px;
  border-radius: 999px;
`

const Recording = styled.View`
  flex-direction: column;
  height: 100px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  border-bottom-width: 1px;
  border-color: #333;
  padding: 20px;
`
const RecordingTitle = styled.Text`
  width: 100%;
  color: white;
  display: flex;
  justify-content: flex-start;
`

const DarkAreaView = styled.SafeAreaView`
  padding-top: 10px;
  background-color: #222;
  height: 85%;
`

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    backgroundColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});