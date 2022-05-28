import { useState, useEffect } from 'react'
import { StatusBar, View, ScrollView} from 'react-native'
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
      console.log('get recordings error: ', err)
    }
  }

  const clearStorage = () => {
    setRecordings([])
    AsyncStorage.clear()
  }

  return (
    <>
      <StatusBar 
        translucent 
        backgroundColor="transparent"
        barStyle="light-content"
      />
        <DarkAreaView>
          <ScrollView overScrollMode='never'>
            <Header onDelete={() => clearStorage()} />
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
        <ControlPanel
          recordings={recordings}
          setRecordings={setRecordings} 
          recording={recording} 
          setRecording={recording => setRecording(recording)}
          handlePress={() => {  }} 
        />
    </>
  )
}

const DarkAreaView = styled.SafeAreaView`
  padding-top: 10px;
  background-color: #222;
  height: 85%;
`