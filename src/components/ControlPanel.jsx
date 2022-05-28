
import { useRef, useEffect } from 'react'
import { Animated } from 'react-native'
import styled from 'styled-components/native'

const ControlPanel = ({ handlePress, recording }) => {
  const borderRadius = useRef(new Animated.Value(50)).current
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (recording) {
      Animated.timing(scale, {
        toValue: 0.6,
        duration: 200,
        useNativeDriver: true
      }).start()
      Animated.timing(borderRadius, {
        toValue: 10,
        duration: 200,
        useNativeDriver: true
      }).start()
    } else {
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start()
      Animated.timing(borderRadius, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true
      }).start()
    }
  }, [recording])



  return (
    <>
      <Wrapper>
        <RecordButtonOutline>
          <RecordButton as={Animated.TouchableOpacity} style={{ borderRadius, transform: [ { scale }]}}
            activeOpacity={.7}
            onPress={() => handlePress()}
          />
        </RecordButtonOutline>
      </Wrapper>
    </>
  )
}

export default ControlPanel

const Wrapper = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: black;
  height: 15%;
`

const RecordButtonOutline = styled.View`

  height: 70px;
  width: 70px;
  background-color: #000;
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