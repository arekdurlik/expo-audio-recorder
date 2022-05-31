import { Modal as RNModal } from 'react-native'
import styled from 'styled-components/native'

const Modal = ({visible, children}) => {

  return (
    <RNModal
      animationType="fade"
      transparent={true}
      visible={visible}
    >
      <ModalBackground>
        <ModalContainer>
          {children}
        </ModalContainer>
      </ModalBackground>
    </RNModal>
  )
}

export default Modal

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
  background-color: #ddd;
  border-radius: 10px;
  overflow: hidden;
  width: 70%;
  margin: 20px;
  align-items: center;
  justify-content: center;
`

export const ModalMessage = styled.Text`
  color: #111;
  padding: 20px 20px 5px 20px;
  text-align: center;
`

export const ModalWarning = styled.Text`
  color: #d11;
  padding: 5px 20px 20px 20px;
  text-align: center;
`

export const ModalButtons = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  border-color: #cccccc;
  border-top-width: 1px;
  background-color: #777;
`

export const ModalButton = styled.TouchableOpacity`
  align-items: center;
  flex: 1;
  padding: 10px;
  z-index: 2;
  background-color: #ddd;
  border-color: #bbb;
`

export const ModalButtonText = styled.Text`
  color: #111;
`