import * as Localization from 'expo-localization'
import en from './lang/en.json'
import pl from './lang/pl.json'
const LanguageCTX = createContext()
export const useTranslation = () => useContext(LanguageCTX)
import i18n from 'i18n-js'

i18n.locale = Localization.locale
i18n.fallbacks = true
i18n.translations = {
  en,
  pl
}

export default LanguageContext
