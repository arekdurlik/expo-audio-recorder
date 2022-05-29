import { useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { Audio } from 'expo-av'
import { formatDuration } from '../helpers'
import styled from 'styled-components/native'
import Slider from '@react-native-community/slider'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRecordingState, storeRecordingsAsync } from '../RecordingContext'

const Recording = ({data: { title, date, duration, uri }, index}) => {
  const [{ recording, recordings, activeRecording }, dispatch] = useRecordingState()
  const [isLoaded, setLoaded]   = useState(false)
  const [isStarted, setStarted] = useState(false)
  const [isPaused, setPaused]   = useState(false)
  const [isActive, setActive]   = useState(false)
  const [position, setPosition] = useState(0)

  const drawerHeight  = useRef(new Animated.Value(0)).current
  const drawerPadding = useRef(new Animated.Value(0)).current
  const drawerOpacity = useRef(new Animated.Value(0)).current
  const sound = useRef(new Audio.Sound())

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true
    })
  }, [])

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(drawerHeight, { toValue: 100, duration: 150, useNativeDriver: false }),
        Animated.timing(drawerPadding, { toValue: 15, duration: 150, useNativeDriver: false }),
        Animated.timing(drawerOpacity, { toValue: 1, duration: 300, useNativeDriver: false })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(drawerHeight, { toValue: 0, duration: 150, useNativeDriver: false }),
        Animated.timing(drawerPadding, { toValue: 0, duration: 150, useNativeDriver: false }),
        Animated.timing(drawerOpacity, { toValue: 0, duration: 300, useNativeDriver: false })
      ]).start()
    }

  }, [isActive])
  
  //unload the sound if the user has started recording
  useEffect(() => {
    if (isLoaded && recording) unloadSound()
  }, [recording])
  
  //unload every sound that is currently loaded if it's not the one that user has just activated
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
  
  const playRecording = async () => {
    if (!isLoaded) {
      await sound.current.loadAsync({ uri }, { shouldPlay: true })
      dispatch({ type: 'SET_ACTIVE_RECORDING', payload: index})
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

  const changeTitle = async ({ nativeEvent: { text }}) => {
    console.log('submit: ', text)
    const newRecordings = [...recordings]
    let newRecording = {...newRecordings[index]}
    newRecording.title = text
    
    await storeRecordingsAsync(newRecordings)
    dispatch({ type: 'SET_RECORDINGS', payload: newRecordings })
  }

  return (
    <Container onPress={() => dispatch({ type: 'SET_ACTIVE_RECORDING', payload: index })}>
      <Info>
        <Title
          onEndEditing={changeTitle}
          selectionColor={'#2159ca'}>
            {title ? title : `New Recording ${index + 1}`}
          </Title>
        <InfoBottom>
          <Date>{date}</Date>
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
            <Ionicons name={ !isStarted || isPaused ? 'md-play' : 'md-pause'} size={28} color="white" />
          </PlayButton>
          <DeleteButton 
            activeOpacity={.7}
            onPress={() => !isStarted || isPaused ? playRecording() : pauseRecording()}
          >
            <Ionicons name="md-trash" size={28} color="#2159ca" />
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
  min-height: 55px;
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
  height: 55px;
`
const Title = styled.TextInput`
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
`

const Buttons = styled.View`
  position: absolute;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  bottom: 0;
  height: 100%;
`

const PlayButton = styled.TouchableOpacity`
  align-self: flex-end;
`

const DeleteButton = styled.TouchableOpacity`
  position: absolute;
  right: 0;
`

