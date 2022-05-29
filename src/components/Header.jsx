import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import styled from 'styled-components/native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRecordingState, storeRecordingsAsync } from '../RecordingContext'

import Modal, { ModalMessage, ModalWarning, ModalButtons, ModalButton, ModalButtonText } from './Modal'

const Header = () => {
  const [{ recordings }, dispatch] = useRecordingState()
  const [modalVisible, setModalVisible] = useState(false)

  const handleDelete = () => {
    storeRecordingsAsync([])
    dispatch({ type: 'SET_ACTIVE_RECORDING', payload: null })
    dispatch({ type: 'SET_RECORDINGS', payload: [] })
    setModalVisible(false)
  }

  return (
    <>
      <Modal visible={modalVisible}>
        <ModalMessage>Delete all recordings?</ModalMessage>
        <ModalWarning>This action is irreversible.</ModalWarning>
        <ModalButtons>
          <ModalButton 
            style={{ borderRightWidth: 1 }}
            activeOpacity={.9}
            onPress={() => handleDelete()}>
            <ModalButtonText>Delete</ModalButtonText>
          </ModalButton>
          <ModalButton
            activeOpacity={.9}
            onPress={() => setModalVisible(false)}>
            <ModalButtonText>Cancel</ModalButtonText>
          </ModalButton>
        </ModalButtons>
      </Modal>
      <Container>
        <Title>All Recordings</Title>
        {recordings.length > 0 && (
          <TouchableOpacity 
            activeOpacity={.7}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="md-trash" size={28} color="#2159ca" />
          </TouchableOpacity>
        )}
      </Container>
    </>
  )
}

export default Header

const Container = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 30px 15px 15px 15px;
`

const Title = styled.Text`
  font-size: 30px;
  color: #ddd;
  font-weight: 700;
  letter-spacing: 1.5px;
`