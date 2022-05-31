import { createContext, useContext, useReducer } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const RecordingStateCTX = createContext()
export const useRecordingState = () => useContext(RecordingStateCTX)

const initialState = {
  recordings: [],
  recording: null,
  activeRecording: null
}

const recordingStateReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RECORDINGS':
      const recordings = action.payload
      return {...state, recordings }
    
    case 'SET_RECORDING':
      const recording = action.payload
      return {...state, recording}
    
    case 'SET_ACTIVE_RECORDING':
      const activeRecording = action.payload
      return {...state, activeRecording}

    default:
      console.error('error in recording reducer', err)
  }
}

const RecordingStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(recordingStateReducer, initialState)

  return (
      <RecordingStateCTX.Provider value={[state, dispatch]}>
        {children}
      </RecordingStateCTX.Provider>
  )
}

export default RecordingStateProvider

export const getRecordingsAsync = async () => {
  let recordings = []
  
  try {
    const payload = await AsyncStorage.getItem('recordings')
    if (payload !== null) {
      recordings = await JSON.parse(payload)
    }
  } catch (err) {
    console.error('get recordings from async storage error: ', err)
  }

  return recordings
}

export const storeRecordingsAsync = async recordings => {
  try {
    const payload = JSON.stringify(recordings)
    await AsyncStorage.setItem('recordings', payload)
  } catch (err) {
    console.error('store recordings in async storage error: ', err)
  }
}
