import i18n from 'i18n-js'

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

export const formatDuration = millis => {
  const minutes = millis / 1000 / 60
  const minutesDisplay = ('0' + Math.floor(minutes)).slice(-2) // prepend zero
  const seconds = Math.round((minutes - minutesDisplay) * 60)
  const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
  return `${minutesDisplay}:${secondsDisplay}`
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

export const initialRecordings = [
  {
    id: 1,
    title: null,
    duration: 2580,
    date: new Date('May 27, 2022 16:12:20'),
    uri: null,
  },
  {
    id: 2,
    title: null,
    duration: 15000,
    date: new Date('May 29, 2022 03:24:00'),
    uri: null,
  },
  {
    id: 3,
    title: 'Test Recording',
    duration: 125000,
    date: new Date('May 30, 2022 07:43:00'),
    uri: null,
  }
]