import { useEffect, useRef, useState } from 'react'
import { Animated, TouchableOpacity, View } from 'react-native'
import { Audio } from 'expo-av'
import styled from 'styled-components/native'
import Slider from '@react-native-community/slider'
import Ionicons from '@expo/vector-icons/Ionicons'
import moment from 'moment'

const Recording = ({data: { title, date, duration, uri }, index, recording, activeRecording, setActiveRecording}) => {
  const [isLoaded, setLoaded]   = useState(false)
  const [isStarted, setStarted] = useState(false)
  const [isPaused, setPaused]   = useState(false)
  const [isActive, setActive]   = useState(false)
  const [position, setPosition] = useState(0)

  const sound = useRef(new Audio.Sound())
  const drawerHeight = useRef(new Animated.Value(0)).current
  const drawerPadding = useRef(new Animated.Value(0)).current
  const drawerOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true
    })
  }, [])

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(drawerHeight, { toValue: 70, duration: 200, useNativeDriver: false }),
        Animated.timing(drawerPadding, { toValue: 15, duration: 200, useNativeDriver: false }),
        Animated.timing(drawerOpacity, { toValue: 1, duration: 200, useNativeDriver: false })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(drawerHeight, { toValue: 0, duration: 200, useNativeDriver: false }),
        Animated.timing(drawerPadding, { toValue: 0, duration: 200, useNativeDriver: false }),
        Animated.timing(drawerOpacity, { toValue: 0, duration: 200, useNativeDriver: false })
      ]).start()
    }

  }, [isActive])
  
  //unload sound if user has started recording
  useEffect(() => {
    if (isLoaded && recording) unloadSound()
  }, [recording])

  //unload every sound that is currently loaded if it's not the one that the user has just activated
  useEffect(() => {
    if (index != activeRecording) {
      if (isLoaded) unloadSound()
      setActive(false)
      return
    }

    setActive(true)
  }, [activeRecording])

  const unloadSound = async () => {
    setPaused(false)
    setActive(false)

    await sound.current.stopAsync()
    setStarted(false)

    await sound.current.setPositionAsync(0)
    setPosition(0)

    await sound.current.unloadAsync()
    setLoaded(false)
  }

  const formatDuration = millis => {
    const minutes = millis / 1000 / 60
    const minutesDisplay = ('0' + Math.floor(minutes)).slice(-2) // prepend zero
    const seconds = Math.round((minutes - minutesDisplay) * 60)
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
    return `${minutesDisplay}:${secondsDisplay}`
  }
  
  const playRecording = async () => {
    if (!isLoaded) {
      await sound.current.loadAsync({ uri }, { shouldPlay: true })
      setActiveRecording(index)
      setLoaded(true)
    }
    
    if (!isStarted) {
      await sound.current.setPositionAsync(0)
    }

    await sound.current.setProgressUpdateIntervalAsync(20)
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
    <Container onPress={() => setActiveRecording(index)}>
      <Info>
        <Title>{title ? title : `Recording ${index + 1}`}</Title>
        <InfoBottom>
          <Date>{moment(date).format('DD MMM YYYY')}</Date>
          <Duration>{formatDuration(duration)}</Duration>
        </InfoBottom>
      </Info>
        <Drawer style={{ 
          height: drawerHeight, 
          paddingTop: drawerPadding, 
          paddingBottom: drawerPadding, 
          opacity: drawerOpacity
        }}>
          <Slider
          style={{width: '100%', height: 10}}
          minimumValue={0}
          maximumValue={1}
          value={position}
          minimumTrackTintColor="#ddd"
          maximumTrackTintColor="#444"
          thumbTintColor='#ddd'
          onValueChange={value => {
            console.log(value)
          }}
        />
        <Buttons>
          <PlayButton 
            activeOpacity={.7}
            onPress={() => !isStarted || isPaused ? playRecording() : pauseRecording()}
          >
            <Ionicons name={ !isStarted || isPaused ? 'md-play' : 'md-pause'} size={32} color="white" />
          </PlayButton>
          <DeleteButton 
            activeOpacity={.7}
            onPress={() => !isStarted || isPaused ? playRecording() : pauseRecording()}
          >
            <Ionicons name="md-trash" size={32} color="#2159ca" />
          </DeleteButton>
        </Buttons>
      {/* <Text style={{ color: 'white' }}>started: {started ? 'true' : 'false' }, paused: {paused ? 'true' : 'false' }, loaded: {loaded ? 'true' : 'false' }</Text> */}
      </Drawer>
    </Container>
  )
}

export default Recording

const Container = styled.Pressable`
  position: relative;
  flex-direction: column;
  min-height: 50px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  border-bottom-width: 1px;
  border-color: #222;
  padding: 10px 15px;
`

const Info = styled.View`
  justify-content: space-between;
  width: 100%;
  height: 50px;
`
const Title = styled.Text`
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  color: white;
  display: flex;
  justify-content: flex-start;
`

const InfoBottom = styled.View`
  flex-direction: row;
  justify-content: space-between;
`

const Date = styled.Text`
  color: #999;
`

const Duration = styled.Text`
  color: #999;
`

const Drawer = styled(Animated.View)`
  align-items: center;
  height: 0px;
  width: 100%;

  overflow: hidden;
`

const Buttons = styled.View`
position: absolute;
  flex-direction: row;
  width: 100%;
  bottom: 0;
  height: 100%;
`

const PlayButton = styled.TouchableOpacity`
  justify-content: center;
  margin: auto;
`

const DeleteButton = styled.TouchableOpacity`
  position: absolute;
  right: 0;
`

