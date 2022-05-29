import { createContext, useContext, useReducer } from 'react'

export const RecoringStateCTX = createContext()
export const useRecordingState = () => useContext(RecoringStateCTX)

const initialState = {
  recordings: [],
  recording: null,
  activeRecording: null
}

export const recordingStateReducer = (state, action) => {
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
    }
}

const RecordingStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(recordingStateReducer, initialState)

  return (
      <RecoringStateCTX.Provider value={[state, dispatch]}>
        {children}
      </RecoringStateCTX.Provider>
  )
}

export default RecordingStateProvider