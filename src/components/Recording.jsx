import { useEffect, useReducer, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { Audio } from 'expo-av'
import { formatDuration } from '../helpers'
import styled from 'styled-components/native'
import Slider from '@react-native-community/slider'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRecordingState, storeRecordingsAsync } from '../RecordingContext'

const initialState = {
  isLoaded: false,
  isStarted: false,
  isPaused: false,
  isActive: false,
  isBeingAltered: false,
  position: 0
}

const reducer = (state, action) => {
    switch(action.type) {
      case 'setLoaded':
        let isLoaded = state.payload
        return { ...state, isLoaded}

      case 'setStarted':
        let isStarted = state.payload
        return { ...state, isStarted}
      
      case 'setPaused':
        let isPaused = state.payload
        return { ...state, isPaused}
      
      case 'setActive':
        let isActive = state.payload
        return { ...state, isActive}
      
      case 'setBeingAltered':
        let isBeingAltered = state.payload
        return { ...state, isBeingAltered}

      case 'setPosition':
        let position = state.payload
        return { ...state, position}

      case 'unload':
        return { ...initialState }

      default:
        console.log('reducer error')
        break
    }
}

const Recording = ({data: { title, date, duration, uri }, index}) => {
  const [{ isLoaded, isStarted, isPaused, isActive, isBeingAltered, position }, set] = useReducer(reducer, initialState)
  const [{ recording, recordings, activeRecording }, dispatch] = useRecordingState()

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
      set({ type: 'setActive', payload: false })
      return
    }

    set({ type: 'setActive', payload: true })
  }, [activeRecording])

  const unloadSound = async () => {
    await sound.current.stopAsync()
    await sound.current.setPositionAsync(0)
    await sound.current.unloadAsync()
    set({ type: 'unload', payload: true })
  }

  const changeSlider = async val => {
    set({ type: 'setBeingAltered', payload: true })
    await sound.current.setPositionAsync(duration * val)
    set({ type: 'setBeingAltered', payload: false })
  } 
  
  const playRecording = async () => {
    if (!isLoaded) {
      await sound.current.loadAsync({ uri }, { shouldPlay: true })
      dispatch({ type: 'SET_ACTIVE_RECORDING', payload: index})
      set({ type: 'setLoaded', payload: true })
    }
    
    if (!isStarted) {
      await sound.current.setPositionAsync(0)
    }

    await sound.current.setProgressUpdateIntervalAsync(20)
    await sound.current.playAsync()
    set({ type: 'setStarted', payload: true })
    set({ type: 'setPasued', payload: false })
    
    sound.current.setOnPlaybackStatusUpdate(status => {
      if (status.isPlaying && !isBeingAltered) 
        set({ type: 'setPosition', payload: status.positionMillis / status.durationMillis })

      if (status.didJustFinish) 
        set({ type: 'setStarted', payload: false })
    })
  }

  const pauseRecording = async () => {
    await sound.current.pauseAsync()
      set({ type: 'setPasued', payload: true })
  }

  const changeTitle = async ({ nativeEvent: { text }}) => {
    const newRecordings = [...recordings]
    newRecordings[index] = {...newRecordings[index], title: text}

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
          onSlidingComplete={changeSlider}
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

