import { useState, useEffect } from 'react'
import { StatusBar, View, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styled from 'styled-components/native'

import Recording from './src/components/Recording'
import Header from './src/components/Header'
import ControlPanel from './src/components/ControlPanel'

export default function App() {
  const [recording, setRecording] = useState()
  const [recordings, setRecordings] = useState([])
  const [activeRecording, setActiveRecording] = useState(null)
  
  useEffect(() => {
      getRecordings()
  }, [])

  const getRecordings = async () => {
    try {
      const value = await AsyncStorage.getItem('recordings')

      if(value !== null) {
        const data = await JSON.parse(value)
        setRecordings(data)
      }
    } catch(err) {
      console.error('get recordings error: ', err)
    }
  }

  const clearStorage = () => {
    setRecordings([])
    AsyncStorage.clear()
  }

  return (
    <View>
      <StatusBar 
        translucent 
        backgroundColor="transparent"
        barStyle="light-content"
        />
        <DarkAreaView>
        <Gradient />
          <ScrollView overScrollMode='never'>
            <Header 
              recordings={recordings}
              onDelete={() => clearStorage()} />
            <View>
              {recordings.map((elem, index) => {
                return (
                  <Recording 
                    data={elem} 
                    index={index} 
                    key={elem.uri} 
                    recording={recording}
                    activeRecording={activeRecording}
                    setActiveRecording={() => setActiveRecording(index)}
                  />
                )
              }).reverse()}
            </View>
          </ScrollView>
        </DarkAreaView>
        <ControlPanel
          recordings={recordings}
          setRecordings={setRecordings} 
          recording={recording} 
          setRecording={recording => setRecording(recording)}
          handlePress={() => {  }} 
        />
    </View>
  )
}

const DarkAreaView = styled.SafeAreaView`
  padding-top: 10px;
  background-color: #000;
  height: 85%;
  margin-bottom: 25%;
`

const Gradient = styled(LinearGradient).attrs({
  colors: ['rgb(0,0,0)', 'transparent'],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
 })`
  height: 50px;
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 999;
`