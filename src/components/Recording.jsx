import { useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { Audio } from 'expo-av'
import { formatDuration, formatDate } from '../helpers'
import styled from 'styled-components/native'
import Slider from '@react-native-community/slider'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRecordingState, storeRecordingsAsync } from '../RecordingContext'
import i18n from 'i18n-js'
import * as Sharing from 'expo-sharing'
import { MaterialIcons } from '@expo/vector-icons'

import Modal, { ModalMessage, ModalWarning, ModalButtons, ModalButton, ModalButtonText } from './Modal'

const Recording = ({data: { title, date, duration, uri, id }, index}) => {
  const [{ recording, recordings, activeRecording }, dispatch] = useRecordingState()
  const [isBeingAltered, setBeingAltered] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isLoaded, setLoaded]   = useState(false)
  const [isStarted, setStarted] = useState(false)
  const [isPaused, setPaused]   = useState(false)
  const [isActive, setActive]   = useState(false)
  
  const drawerHeight  = useRef(new Animated.Value(0)).current
  const drawerPadding = useRef(new Animated.Value(0)).current
  const drawerOpacity = useRef(new Animated.Value(0)).current
  const sliderRef = useRef(null)
  const sound = useRef(new Audio.Sound())
  const position = useRef(0)

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true
    })
  }, [])

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(drawerHeight, { toValue: 100, duration: 300, useNativeDriver: false }),
        Animated.timing(drawerPadding, { toValue: 15, duration: 300, useNativeDriver: false }),
        Animated.timing(drawerOpacity, { toValue: 1, duration: 150, useNativeDriver: false })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(drawerHeight, { toValue: 0, duration: 300, useNativeDriver: false }),
        Animated.timing(drawerPadding, { toValue: 0, duration: 300, useNativeDriver: false }),
        Animated.timing(drawerOpacity, { toValue: 0, duration: 150, useNativeDriver: false })
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
  
  const playRecording = async () => {
    if (!isLoaded) {
      await sound.current.loadAsync({ uri }, { shouldPlay: true })
      dispatch({ type: 'SET_ACTIVE_RECORDING', payload: index})
      setLoaded(true)
    }
    
    if (!isStarted) await sound.current.setPositionAsync(0)

    await sound.current.setProgressUpdateIntervalAsync(1)
    await sound.current.setRateAsync(0.5)
    await sound.current.playAsync()
    setStarted(true)
    setPaused(false)
    
    sound.current.setOnPlaybackStatusUpdate(status => {
      if (status.isPlaying && !isBeingAltered) {
        sliderRef.current.setNativeProps({ value: status.positionMillis / status.durationMillis })
        position.current = status.positionMillis / status.durationMillis
      }
      
      if (status.didJustFinish) setStarted(false)
    })
  }

  const pauseRecording = async () => {
    setPaused(true)
    await sound.current.pauseAsync()
  }

  const skipForward = async () => {
    await sound.current.setPositionAsync((duration * position.current) + 10000)
    sliderRef.current.setNativeProps({ value: position.current - (10000 / duration) })
  }

  const skipBackward = async () => {
    await sound.current.setPositionAsync((duration * position.current) - 10000)
    sliderRef.current.setNativeProps({ value: position.current - (10000 / duration) })
  }

  const deleteRecording = async () => {
    setActive(false)
    const newRecordings = [...recordings]
    newRecordings.splice(index, 1)
    await storeRecordingsAsync(newRecordings)
    dispatch({ type: 'SET_ACTIVE_RECORDING', payload: null})
    dispatch({ type: 'SET_RECORDINGS', payload: newRecordings })
    setModalVisible(false)
  }

  const shareRecording = async () => {
    await Sharing.shareAsync(uri)
  }

  const unloadSound = async () => {
    setPaused(false)
    setActive(false)

    await sound.current.stopAsync()
    setStarted(false)

    await sound.current.setPositionAsync(0)

    setLoaded(false)
    await sound.current.unloadAsync()
  }

  const changeSlider = async val => {
    setBeingAltered(true)
    await sound.current.setPositionAsync(duration * val)
    setBeingAltered(false)
  } 

  const changeTitle = async ({ nativeEvent: { text }}) => {
    if (text == `${i18n.t('recording.defaultTitle')} ${id}`) return
    
    const newRecordings = [...recordings]
    newRecordings[index] = {...newRecordings[index], title: text}

    await storeRecordingsAsync(newRecordings)
    dispatch({ type: 'SET_RECORDINGS', payload: newRecordings })
  }

  return (
    <>
      <Modal visible={modalVisible}>
        <ModalMessage>{i18n.t('recording.delete.message')}</ModalMessage>
        <ModalWarning>{i18n.t('recording.delete.warning')}</ModalWarning>
        <ModalButtons>
          <ModalButton 
            style={{ borderRightWidth: 1 }}
            activeOpacity={.9}
            onPress={deleteRecording}>
            <ModalButtonText>{i18n.t('modal.delete')}</ModalButtonText>
          </ModalButton>
          <ModalButton
            activeOpacity={.9}
            onPress={() => setModalVisible(false)}>
            <ModalButtonText>{i18n.t('modal.cancel')}</ModalButtonText>
          </ModalButton>
        </ModalButtons>
      </Modal>
      <Container onPress={() => dispatch({ type: 'SET_ACTIVE_RECORDING', payload: index })}>
        <Info>
          <Title
            onEndEditing={changeTitle}
            selectionColor={'#2159ca'}
            autoCorrect={false}
          >
            {title ? title : `${i18n.t('recording.defaultTitle')} ${id}`}
          </Title>
          <InfoBottom>
            <Date>{formatDate(date)}</Date>
            <Duration>{formatDuration(duration)}</Duration>
          </InfoBottom>
        </Info>
          <Drawer style={{ 
            height: drawerHeight, 
            paddingTop: drawerPadding, 
            paddingBottom: drawerPadding, 
            opacity: drawerOpacity}}
          >
            <Slider
            ref={sliderRef}
            style={{width: '100%', height: 0}}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#ddd"
            maximumTrackTintColor="#777"
            thumbTintColor='#ddd'
            onSlidingComplete={changeSlider}
          />
          <Buttons>
            <ShareButton 
              activeOpacity={.7}
              onPress={shareRecording}
            >
              <Ionicons name="md-share-outline" size={28} color="#2159ca" />
            </ShareButton>
            <ReplayButton 
              activeOpacity={.7}
              onPress={skipBackward}
            >
              <MaterialIcons name="replay-5" size={38} color="#ddd" />
            </ReplayButton>
            <PlayButton 
              activeOpacity={.7}
              onPress={() => !isStarted || isPaused ? playRecording() : pauseRecording()}
            >
              <Ionicons name={ !isStarted || isPaused ? 'md-play' : 'md-pause'} size={38} color="#ddd" />
            </PlayButton>
            <ForwardButton 
              activeOpacity={.7}
              onPress={skipForward}
            >
              <MaterialIcons name="forward-5" size={38} color="#ddd" />
            </ForwardButton>

            <DeleteButton 
              activeOpacity={.7}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="md-trash" size={28} color="#2159ca" />
            </DeleteButton>
          </Buttons>
        </Drawer>
      </Container>
    </>
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
  align-self: flex-start;
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

const ShareButton = styled.TouchableOpacity`
  position: absolute;
  left: 0;
`

const ForwardButton = styled.TouchableOpacity`
  align-self: flex-end;
`

const PlayButton = styled.TouchableOpacity`
  align-self: flex-end;
  margin: 0 10px;
`
const ReplayButton = styled.TouchableOpacity`
  align-self: flex-end;
`

const DeleteButton = styled.TouchableOpacity`
  position: absolute;
  right: 0;
`

