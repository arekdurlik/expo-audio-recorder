import RecordingStateProvider from './src/RecordingContext'
import Home from './src/Home'
import * as Localization from 'expo-localization'
import translations from './src/lang/translations'
import i18n from 'i18n-js'

(async () => {
  i18n.defaultLocale = 'en'
  i18n.fallbacks = true
  i18n.translations = translations
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