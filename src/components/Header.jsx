import { useState } from 'react'
import { TouchableOpacity, Modal } from 'react-native'
import styled from 'styled-components/native'
import Ionicons from '@expo/vector-icons/Ionicons'

const Header = ({ recordings, onDelete }) => {
  const [modalVisible, setModalVisible] = useState(false)

  const handleDelete = () => {
    onDelete()
    setModalVisible(false)
  }

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.')
          setModalVisible(!modalVisible);
        }}>
        <ModalBackground>
          <ModalContainer>
            <ModalMessage>Delete all recordings?</ModalMessage>
            <ModalButtons>
              <ModalButton
                onPress={() => handleDelete()}>
                <ModalButtonText>Delete</ModalButtonText>
              </ModalButton>
              <ModalButton
                onPress={() => setModalVisible(!modalVisible)}>
                <ModalButtonText>Cancel</ModalButtonText>
              </ModalButton>
            </ModalButtons>
          </ModalContainer>
        </ModalBackground>
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

const ModalBackground = styled.View`
position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.5);
`

const ModalContainer = styled.View`
  background-color: #333;
  border-radius: 10px;
  padding: 20px;
  width: 70%;
  margin: 20px;
  align-items: center;
  justify-content: center;
`

const ModalMessage = styled.Text`
  color: #ddd;
  padding: 20px;
`

const ModalButtons = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`

const ModalButton = styled.TouchableOpacity`
  align-items: center;
  flex: 1;
  border-radius: 10px;
  padding: 10px;
  z-index: 2;
  background-color: #ddd;
  margin: 5px;
`

const ModalButtonText = styled.Text`
  color: #111;
`
