import RecordingStateProvider from './src/RecordingContext'
import Home from './src/Home'

const App = () => {
  

  return (
    <RecordingStateProvider>
      <Home />
    </RecordingStateProvider>
  )
}

export default App