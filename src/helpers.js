import i18n from 'i18n-js'

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

export const formatDuration = millis => {
  const minutes = millis / 1000 / 60
  const minutesDisplay = ('0' + Math.floor(minutes)).slice(-2) // prepend zero
  const seconds = Math.round((minutes - minutesDisplay) * 60)
  const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
  return `${minutesDisplay}:${secondsDisplay}`
}

export const formatDate = string => {
  const date = new Date(string)
  const months = [
    i18n.t('months.january'),
    i18n.t('months.february'),
    i18n.t('months.march'),
    i18n.t('months.april'),
    i18n.t('months.may'),
    i18n.t('months.june'),
    i18n.t('months.july'),
    i18n.t('months.august'),
    i18n.t('months.september'),
    i18n.t('months.october'),
    i18n.t('months.november'),
    i18n.t('months.december'),
  ]
  const day = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  const time = `${('0' +  date.getHours()).slice(-2)}:${('0' +  date.getMinutes()).slice(-2)}` // prepend zero
  return `${day} ${time}`
}

export const getNextId = recordings => {
  let newIndex = 1

  if (recordings?.length > 0) newIndex = parseInt(recordings[recordings.length - 1].id) + 1

  return newIndex
}