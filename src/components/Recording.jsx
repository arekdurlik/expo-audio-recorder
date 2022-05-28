import styled from 'styled-components/native'
import Ionicons from '@expo/vector-icons/Ionicons'
import Slider from '@react-native-community/slider'
import { TouchableOpacity, Text } from 'react-native'
import { Audio } from 'expo-av'
import { useEffect, useRef, useState } from 'react'

const Recording = ({data: { title, uri, duration }, index, recording, activeRecording, setActiveRecording}) => {
  const [isLoaded, setLoaded] = useState(false)
  const [isStarted, setStarted] = useState(false)
  const [isPaused, setPaused] = useState(false)
  const [position, setPosition] = useState(0)
  const sound = useRef(new Audio.Sound())
  
  //unload if user has started recording
  useEffect(() => {
    if (isLoaded && recording) {
      unloadSound()
    }
  }, [recording])

  //unload every sound that is currently loaded if it's not the one that the user has just activated
  useEffect(() => {
    if (isLoaded && index != activeRecording) unloadSound()
  }, [activeRecording])

  const unloadSound = async () => {
    setPaused(false)

    await sound.current.stopAsync()
    setStarted(false)

    await sound.current.setPositionAsync(0);
    setPosition(0)

    await sound.current.unloadAsync()
    setLoaded(false)
  }

  const formatDuration = millis => {
    const minutes = millis / 1000 / 60
    const minutesDisplay = Math.floor(minutes)
    const seconds = Math.round((minutes - minutesDisplay) * 60)
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
    return `${minutesDisplay}:${secondsDisplay}`
  }
  
  const playRecording = async () => {
    if (!isLoaded) {
      await sound.current.loadAsync({ uri: uri }, { shouldPlay: true })
      setActiveRecording(index)
      setLoaded(true)
    }
    
    if (!isStarted) {
      await sound.current.setPositionAsync(0);
      await sound.current.setStatusAsync({ progressUpdateIntervalMillis: 50 })
    }
    
    await sound.current.playAsync()
    setStarted(true)
    
    setPaused(false)
    
    sound.current.setOnPlaybackStatusUpdate(status => {
      if (status.isPlaying) setPosition(status.positionMillis / status.durationMillis)

      if (status.didJustFinish) setStarted(false)
    })
  }

  const pauseRecording = async () => {
    await sound.current.pauseAsync()
    setPaused(true)
  }

  return (
    <Container>
      <RecordingTitle>{title ? title : `Recording ${index + 1}`} - {formatDuration(duration)}</RecordingTitle>
      <TouchableOpacity 
        activeOpacity={.7}
        onPress={() => !isStarted || isPaused ? playRecording() : pauseRecording()}
      >
        <Ionicons name={ !isStarted || isPaused ? 'md-play' : 'md-pause'} size={32} color="white" />
      </TouchableOpacity>
      {/* <Text style={{ color: 'white' }}>started: {started ? 'true' : 'false' }, paused: {paused ? 'true' : 'false' }, loaded: {loaded ? 'true' : 'false' }</Text> */}
      <Slider
        style={{width: '100%', height: 40}}
        minimumValue={0}
        maximumValue={1}
        value={position}
        minimumTrackTintColor="#ddd"
        maximumTrackTintColor="#000"
        thumbTintColor='#ddd'
        onValueChange={value => {
          console.log(value)
        }}
      />
    </Container>
  )
}

export default Recording

const Container = styled.View`
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
