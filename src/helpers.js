import i18n from 'i18n-js'

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

export const formatDuration = millis => {
  const hours = millis / (1000*60*60)
  const absoluteHours = Math.floor(hours)
  const hoursDisplay = absoluteHours > 0 ? `${('0' + absoluteHours).slice(-2)}:` : ''

  const minutes = (hours - absoluteHours) * 60
  const absoluteMinutes = Math.floor(minutes)
  const minutesDisplay = `${('0' + absoluteMinutes).slice(-2)}:` // prepend zero

  const seconds = (minutes - absoluteMinutes) * 60
  const absoluteSeconds = Math.floor(seconds)
  const secondsDisplay = ('0' + absoluteSeconds).slice(-2)
  return `${hoursDisplay}${minutesDisplay}${secondsDisplay}`
}

export const formatDate = (format, string) => {
  const date = new Date(string)

  const months = [
    i18n.t('date.months.january'),
    i18n.t('date.months.february'),
    i18n.t('date.months.march'),
    i18n.t('date.months.april'),
    i18n.t('date.months.may'),
    i18n.t('date.months.june'),
    i18n.t('date.months.july'),
    i18n.t('date.months.august'),
    i18n.t('date.months.september'),
    i18n.t('date.months.october'),
    i18n.t('date.months.november'),
    i18n.t('date.months.december'),
  ]

  const formatted = i18n.t(format, { 
    year: date.getFullYear(),
    month: months[date.getMonth()],
    day: i18n.t('date.prependZero') ? ('0' + date.getDate()).slice(-2) : date.getDate(),
    hours: ('0' + date.getHours()).slice(-2),
    minutes: ('0' + date.getMinutes()).slice(-2)
  })
  
  return formatted
}

export const getNextId = recordings => {
  let newIndex = 1

  if (recordings?.length > 0) newIndex = parseInt(recordings[recordings.length - 1].id) + 1

  return newIndex
}