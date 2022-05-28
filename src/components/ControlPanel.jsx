
import { useRef, useEffect, useState } from 'react'
import { Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Audio } from 'expo-av'
import { clamp } from '../helpers'
import styled from 'styled-components/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ControlPanel = ({ recordings, setRecordings, recording, setRecording }) => {
  const [recordingData, setRecordingData] = useState(new Array(10).fill(0))
  const [recordingTime, setRecordingTime] = useState(0)
  const borderRadius = useRef(new Animated.Value(50)).current
  const scale = useRef(new Animated.Value(1)).current
  const background = useRef(new Animated.Value(0)).current

  const backgroundColor = background.interpolate({
    inputRange: [0, 0.75],
    outputRange: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.75)"]
  });

  useEffect(() => {
    if (recording) {
      Animated.parallel([
        Animated.timing(background, { toValue: 0.75, duration: 500, useNativeDriver: false }),
        Animated.timing(scale, { toValue: 0.6, duration: 200, useNativeDriver: true }),
        Animated.timing(borderRadius, { toValue: 10, duration: 200, useNativeDriver: true })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(background, { toValue: 0, duration: 500, useNativeDriver: false }),
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(borderRadius, { toValue: 50, duration: 200, useNativeDriver: true })
      ]).start()
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
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
          ({ durationMillis, metering }) => {
            const loudness = metering + 160 * 0.9 // around 0-100
            if (typeof loudness === 'number' && !Number.isNaN(loudness)) {
              setRecordingData(oldData => {
                if (oldData.length >= 10) oldData.shift()
                return [...oldData, clamp(loudness, 0 , 100)]
              })
            }
            setRecordingTime(durationMillis)
          },
          10
        )

        setRecording(recording)
      } else {
          console.error('permissions not granted error: ', err)
      }
    } catch (err) {
      console.error('recording start error: ', err)
    }   
  }

  const stopRecording = async () => {
    setRecording(undefined)
    try {
      await recording.stopAndUnloadAsync()
    } catch (err) {
      console.log('recording stop error: ', err)
    }

    const { status } = await recording.createNewLoadedSoundAsync()

    console.log('recording saved at: ' + recording.getURI())

    const newRecordings = [...recordings, {
      title: null,
      duration: status.durationMillis,
      date: new Date(),
      uri: recording.getURI(),
    }]

    await AsyncStorage.setItem('recordings', JSON.stringify(newRecordings))

    setRecordings(newRecordings)
  }

  return (
    <>
      <WaveForm 
        pointerEvents="none" 
        style={{ backgroundColor }}
      >
        {recording && recordingData.map((bar, index) => {
          return (
            <BarWrapper 
              key={index} 
              style={{ height: bar * 4.5, opacity: bar / 75 }} 
            >
              <Bar />
            </BarWrapper>
          )
        })}
      </WaveForm>
      <Gradient />
      <Wrapper>
        <Controls>
          <RecordButtonOutline>
            <RecordButton 
              as={Animated.TouchableOpacity} 
              style={{ borderRadius, transform: [ { scale }]}}
              activeOpacity={.7}
              onPress={() => recording ? stopRecording() : startRecording() }
            />
          </RecordButtonOutline>
        </Controls>
      </Wrapper>
    </>
  )
}

export default ControlPanel

export const Gradient = styled(LinearGradient).attrs({
  colors: ['transparent','rgb(0,0,0)'],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
 })`
  height: 50px;
  width: 100%;
  position: absolute;
  bottom: 15%;
 `;

const Wrapper = styled.View`
  background-color: black;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 15%;
  overflow: hidden;
`

const WaveForm = styled(Animated.View)`
  flex-direction: row;
  top: 0;
  bottom: 0;
  position: absolute;
  align-items: center;
  height: 100%;
  width: 100%;
  margin: 4px;
`
const BarWrapper = styled.View`
  padding: 2px;
  flex: 1;
`

const Bar = styled.View`
  background-color: #a00;
  width: 100%;
  height: 100%;
`

const Controls = styled.View`
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

`

const RecordButtonOutline = styled.View`
  height: 70px;
  width: 70px;
  background-color: rgba(0,0,0,0.5);
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