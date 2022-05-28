import { StyleSheet, Modal, StatusBar, Text, View, Pressable, SafeAreaView, ScrollView} from 'react-native'
import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { Audio } from 'expo-av'
import AsyncStorage from '@react-native-async-storage/async-storage'
import styled from 'styled-components/native'
import ControlPanel from './src/components/ControlPanel'
import Recording from './src/components/Recording'

export default function App() {
  const [recording, setRecording] = useState()
  const [recordings, setRecordings] = useState([])
  const [message, setMessage] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  

  const getRecordings = async () => {
    try {
      const value = await AsyncStorage.getItem('recordings')
      if(value !== null) {
        const data = await JSON.parse(value)
        setRecordings(data)
      }
    } catch(e) {
    }
  }

  const clearStorage = () => {
    setRecordings([])
    AsyncStorage.clear()
  }

  useEffect(() => {
      getRecordings()
  }, [])

  useEffect(() => {
    console.log('recs: ',  recordings)
  }, [recordings])

  

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync()

      
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true
        })
        
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
          )
          
          setRecording(recording)
        } else {
          setMessage('Please grant permission to access microphone', err)
        }
      } catch (err) {
        console.error('Failed to start recording', err)
      }   
  }

  const stopRecording = async () => {
    setRecording(undefined)
    try {
      await recording.stopAndUnloadAsync()
    } catch (err) {
      console.log('recording err', err)
    }

    const { sound, status } = await recording.createNewLoadedSoundAsync()

    console.log('recording saved at: ' + recording.getURI())

    const newRecordings = [...recordings, recording.getURI()]

    await AsyncStorage.setItem('recordings', JSON.stringify(newRecordings))

    setRecordings(newRecordings)
  }

  const playRecording = () => {

  }

  const deleteRecording = index => {
    console.log(index)
  } 

  return (
    <>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Hello World!</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>Hide Modal</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      <StatusBar translucent 
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
        <DarkAreaView>
          <ScrollView overScrollMode='never'>
          <Pressable onPress={() => clearStorage()}>
            <Text style={{ color: 'white' }}>Reset AsyncStorage</Text>
          </Pressable>
            <View>
              {recordings.map((rec, index) => {
                console.log(rec)
                return (
                  <Recording rec={rec} index={index} key={index}/>
                )
              })}
            </View>
          </ScrollView>
        </DarkAreaView>
        <ControlPanel recording={recording} handlePress={() => { recording ? stopRecording() : startRecording() }} />
    </>
  )
}







const DarkAreaView = styled.SafeAreaView`
  padding-top: 10px;
  background-color: #222;
  height: 85%;
`

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    backgroundColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});