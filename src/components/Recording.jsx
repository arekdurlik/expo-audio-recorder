import styled from 'styled-components/native'
import Ionicons from '@expo/vector-icons/Ionicons'
import Slider from '@react-native-community/slider'
import { Audio } from 'expo-av'
import { useEffect, useState } from 'react'

const Recording = ({rec, index}) => {
  const [position, setPosition] = useState(0)

  useEffect(() => {
    
  }, [])
  
  const getDurationFormatted = (millis) => {
    console.log(millis)
    const minutes = millis / 1000 / 60
    const minutesDisplay = Math.floor(minutes)
    const seconds = Math.round((minutes - minutesDisplay) * 60)
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
    return `${minutesDisplay}:${secondsDisplay}`
  }
  
  const playRecording = async () => {
    const { sound } = await Audio.Sound.createAsync({ uri: rec }, {shouldPlay: true})
    await sound.setPositionAsync(0);
    await sound.setStatusAsync({ progressUpdateIntervalMillis: 50 })
    await sound.playAsync()

    sound.setOnPlaybackStatusUpdate(status => {
      setPosition(status.positionMillis / status.durationMillis)
    })

  }

  return (
    <Container>
      <RecordingTitle>Recording {index + 1} - </RecordingTitle>
      <Button 
        activeOpacity={.7}
        onPress={() => playRecording()}
      >
        <Ionicons name="md-play" size={32} color="white" />
      </Button>
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

const Button = styled.TouchableOpacity`
  min-width: 60px;
  border-radius: 10px;
`

const RecordingTitle = styled.Text`
  width: 100%;
  color: white;
  display: flex;
  justify-content: flex-start;
`

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
