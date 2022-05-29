import { useEffect } from 'react'
import { StatusBar, View, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native'

import Recording from './components/Recording'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import { useRecordingState, getRecordingsAsync } from './RecordingContext'

const Home = () => {
  const [{ recordings, recording }, dispatch] = useRecordingState()
  
  useEffect(() => {
    getRecordings()
  }, [])

  const getRecordings = async () => {
    const recordings = await getRecordingsAsync()
    dispatch({ type: 'SET_RECORDINGS', payload: recordings })
  }

  return (
    <View>
      <StatusBar 
        translucent 
        backgroundColor="transparent"
        barStyle="light-content"
        />
        <DarkAreaView pointerEvents={recording ? 'none' : 'auto'}>
        <Gradient />
          <ScrollView overScrollMode='never'>
            <Header />
            <View>
              {recordings.map((elem, index) => {
                return (
                  <Recording 
                    data={elem} 
                    key={index} 
                  />
                )
              }).reverse()}
            </View>
          </ScrollView>
        </DarkAreaView>
        <ControlPanel
        />
    </View>
  )
}

export default Home

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