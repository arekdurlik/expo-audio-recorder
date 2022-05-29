export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

export const formatDuration = millis => {
  const minutes = millis / 1000 / 60
  const minutesDisplay = ('0' + Math.floor(minutes)).slice(-2) // prepend zero
  const seconds = Math.round((minutes - minutesDisplay) * 60)
  const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
  return `${minutesDisplay}:${secondsDisplay}`
}

export const formatDate = date => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const day = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  const time = `${('0' +  date.getHours()).slice(-2)}:${('0' +  date.getMinutes()).slice(-2)}`
  return `${day} ${time}`
}