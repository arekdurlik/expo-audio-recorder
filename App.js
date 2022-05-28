import { StyleSheet, StatusBar, Text, View, Pressable, SafeAreaView, ScrollView} from 'react-native'
import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { Audio } from 'expo-av'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styled from 'styled-components/native'
import Recording from './src/components/Recording'
import ControlPanel from './src/components/ControlPanel'

export default function App() {
  const [recording, setRecording] = useState()
  const [recordings, setRecordings] = useState([])
  const [activeRecording, setActiveRecording] = useState(null)
  
  useEffect(() => {
      getRecordings()
  }, [])

  useEffect(() => {
    console.log('recs: ',  recordings)
  }, [recordings])

  const getRecordings = async () => {
    try {
      const value = await AsyncStorage.getItem('recordings')
      if(value !== null) {
        const data = await JSON.parse(value)
        setRecordings(data)
      }
    } catch(e) {}
  }

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
      title: null,
      duration: status.durationMillis,
      uri: recording.getURI(),
    }]

    await AsyncStorage.setItem('recordings', JSON.stringify(newRecordings))

    setRecordings(newRecordings)
  }

  return (
    <>
      <StatusBar translucent 
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
        <DarkAreaView>
          <ScrollView overScrollMode='never'>
            <View>
              {recordings.map((elem, index) => {
                return (
                  <Recording 
                  data={elem} 
                  index={index} 
                  key={index} 
                  recording={recording}
                  activeRecording={activeRecording}
                  setActiveRecording={() => setActiveRecording(index)}
                  />
                )
              })}
            </View>
          </ScrollView>
        </DarkAreaView>
        <ControlPanel recording={recording} handlePress={() => { recording ? stopRecording() : startRecording() }} />
    </>
  )
}

const DarkAreaView = styled.SafeAreaView`
  padding-top: 10px;
  background-color: #222;
  height: 85%;
`
