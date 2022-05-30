import { useRef, useEffect, useState } from 'react'
import { Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Audio } from 'expo-av'
import { clamp, formatDuration, getNextId } from '../helpers'
import styled from 'styled-components/native'
import { useRecordingState, storeRecordingsAsync } from '../RecordingContext'

const ControlPanel = () => {
  const [{ recordings, recording }, dispatch] = useRecordingState()
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingData = useRef(new Array(18).fill(0))
  const borderRadius = useRef(new Animated.Value(50)).current
  const scale = useRef(new Animated.Value(1)).current
  const background = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  const backgroundColor = background.interpolate({
    inputRange: [0, 0.85],
    outputRange: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.85)"]
  })
  
  const text = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  })

  useEffect(() => {
    if (recording) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(background, { toValue: 0.85, duration: 500, useNativeDriver: false }),
        Animated.timing(scale, { toValue: 0.6, duration: 200, useNativeDriver: true }),
        Animated.timing(borderRadius, { toValue: 10, duration: 200, useNativeDriver: true })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: false }),
        Animated.timing(background, { toValue: 0, duration: 500, useNativeDriver: false }),
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(borderRadius, { toValue: 50, duration: 200, useNativeDriver: true })
      ]).start()
    }
  }, [recording])

  const startRecording = async () => {
    dispatch({ type: 'SET_ACTIVE_RECORDING', payload: null})
    
    try {
      const permission = await Audio.requestPermissionsAsync()

      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true
        })
        
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        )

        recording.setOnRecordingStatusUpdate(({ durationMillis, metering }) => {
          const loudness = metering + 100 // around 0-100
          if (typeof loudness === 'number' && !Number.isNaN(loudness)) {
            if (recordingData.current.length >= 18) recordingData.current.shift()
            recordingData.current.push(clamp(loudness, 0 , 100))
          }
          
          setRecordingTime(durationMillis)
        })

        recording.setProgressUpdateInterval(10)

        dispatch({ type: 'SET_RECORDING', payload: recording })
      } else {
          console.error('permissions not granted: ', err)
      }
    } catch (err) {
      console.error('recording start: ', err)
    }   
  }

  const stopRecording = async () => {
    dispatch({ type: 'SET_RECORDING', payload: undefined })

    try {
      await recording.stopAndUnloadAsync()
    } catch (err) {
      console.log('recording stop error: ', err)
    }

    const { status } = await recording.createNewLoadedSoundAsync()
    
    console.log('recording saved at: ' + recording.getURI())
    
    const newRecordings = [...recordings, {
      id: getNextId(recordings),
      title: null,
      duration: status.durationMillis,
      date: new Date(),
      uri: recording.getURI(),
    }]
    await storeRecordingsAsync(newRecordings)
    dispatch({ type: 'SET_RECORDINGS', payload: newRecordings })
    recordingData.current = new Array(18).fill(0)
  }

  return (
    <>
      <Waveform 
        pointerEvents="none" 
        style={{ backgroundColor }}
      >
        <Timer>
          <Time style={{ opacity: text }}>{formatDuration(recordingTime)}</Time>
        </Timer>
        {recording && recordingData.current.map((bar, index) => {
          return (
            <BarWrapper 
              key={index} 
              style={{ height: bar * 4, opacity: bar / 50 }} 
            >
              <Bar />
            </BarWrapper>
          )
        })}
      </Waveform>
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


const Gradient = styled(LinearGradient).attrs({
  colors: ['transparent','rgb(0,0,0)'],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
 })`
  height: 50px;
  width: 100%;
  position: absolute;
  bottom: 0;
  `

const Timer = styled.View`
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 22%;
`

const Time = styled(Animated.Text)`
  color: #ddd;
  font-weight: 700;
  font-size: 55px;
  z-index: 999;
`

const Wrapper = styled.View`
  background-color: black;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 15%;
  overflow: hidden;
  `

const Waveform = styled(Animated.View)`
  flex-direction: row;
  top: 0;
  bottom: 0;
  position: absolute;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 4px;
  `
const BarWrapper = styled.View`
  padding: 4px;
  flex: 1;
  `

const Bar = styled.View`
  background-color: #a00;
  width: 100%;
  height: 100%;
  border-radius: 5px;
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
  height: 68px;
  width: 68px;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.5);
  border-width: 4px;
  border-color: #aaa;
  border-radius: 9999px;

  `

const RecordButton = styled.TouchableOpacity`
  background-color: #bb0000;
  transition: 1ms ease-in-out;
  height: 55px;
  width: 55px;
  border-radius: 999px;
  `