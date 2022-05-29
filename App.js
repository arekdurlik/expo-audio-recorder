import RecordingStateProvider from './src/RecordingContext'
import Home from './src/Home'
import * as Localization from 'expo-localization'
import en from './src/lang/en.json'
import pl from './src/lang/pl.json'
import i18n from 'i18n-js'

(async () => {
  i18n.defaultLocale = 'en'
  i18n.fallbacks = true
  i18n.translations = { en, pl }
  const { locale } = await Localization.getLocalizationAsync()
  i18n.locale = locale
})()

const App = () => {
  
  return (
    <RecordingStateProvider>
      <Home />
    </RecordingStateProvider>
  )
}

export default App