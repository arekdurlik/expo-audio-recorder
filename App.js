import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Pressable, Animated, SafeAreaView, ScrollView} from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { Audio } from 'expo-av'
import styled from 'styled-components/native'
import Ionicons from '@expo/vector-icons/Ionicons'
import Slider from '@react-native-community/slider'

export default function App() {
  const [recording, setRecording] = useState()
  const [recordings, setRecordings] = useState([])
  const [message, setMessage] = useState('')
  const borderRadius = useRef(new Animated.Value(50)).current;
  const scale = useRef(new Animated.Value(1)).current;

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

    let updatedRecordings = [...recordings]
    const { sound, status } = await recording.createNewLoadedSoundAsync()

    updatedRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI()
    })

    console.log(recording.getURI())

    setRecordings(updatedRecordings)
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
    return recordings.map((recordingLine, index) => {
      return (
        <Recording 
          key={index} 
          style={styles.row}>
            <RecordingTitle>Recording {index + 1} - {recordingLine.duration}</RecordingTitle>
            
            <Button 
              activeOpacity={.7}
              onPress={() => recordingLine.sound.replayAsync()}
            >
              <Ionicons name="md-play" size={32} color="white" />
            </Button>
            <Slider
              style={{width: 100, height: 40}}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              onValueChange={value => {
                console.log(value)
              }}
            />
        </Recording>
      )
    })
  }

  return (
    <>
      <SafeAreaView >
        <ScrollView>
          <View style={styles.container}>
            <Text>{message}</Text>
            <Pressable style={styles.btn} >
              <Text styles={styles.btnText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
            </Pressable>
            {getRecordingLines()}
            <StatusBar style="auto" />
          </View>
        </ScrollView>
      </SafeAreaView>
      <ControlPanel>
        <RecordButtonOutline />
        <RecordButton as={Animated.TouchableOpacity} style={{ borderRadius, transform: [ { scale }]}}
          activeOpacity={.7}
          onPress={recording ? stopRecording : startRecording }
          recording={recording}
        />
      </ControlPanel>
    </>
  )
}

const Button = styled.TouchableOpacity`
  min-width: 60px;
  border-radius: 10px;
`

const ButtonText = styled.Text`
  width: 100%;
  text-align: center;
  font-weight: bold;
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
  height: 100px;
`

const RecordButtonOutline = styled.View`
  position: absolute;
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
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: red;
`
const RecordingTitle = styled.Text`
  width: 100%;
  color: white;
  display: flex;
  justify-content: flex-start;
`

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1,
    margin: 16,
    color: '#ddd'
  },
  btn: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  btnText: {
    color: 'black'
  }
});
