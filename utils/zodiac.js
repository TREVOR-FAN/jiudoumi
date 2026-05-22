// Chinese Zodiac calculation from birth date
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

/**
 * Calculate Chinese zodiac from birth date string
 * @param {string} birthDate - YYYY-MM-DD format
 * @returns {string} Chinese zodiac animal
 */
function getZodiac(birthDate) {
  if (!birthDate) return ''

  const year = parseInt(birthDate.split('-')[0])
  // Chinese zodiac is based on lunar new year, but for baby enrichment
  // we use a simplified solar-based calculation (offset by 4 from Gregorian)
  // Lunar new year typically falls between Jan 21 - Feb 20
  const month = parseInt(birthDate.split('-')[1])
  const day = parseInt(birthDate.split('-')[2])

  // If born before lunar new year (approx Feb 4), use previous year's zodiac
  const adjustedYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year

  const index = (adjustedYear - 4) % 12
  return ZODIAC[index < 0 ? index + 12 : index]
}

/**
 * Calculate age in months from birth date
 * @param {string} birthDate - YYYY-MM-DD format
 * @returns {number} Age in months
 */
function getAgeInMonths(birthDate) {
  if (!birthDate) return 0

  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  return years * 12 + months
}

function getAgeInMonthsAndDays(birthDate) {
  if (!birthDate) return { months: 0, days: 0 }
  const b = new Date(birthDate), n = new Date()
  let m = (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth())
  let ref = new Date(b); ref.setMonth(ref.getMonth() + m)
  let days = Math.floor((n - ref) / 86400000)
  if (days < 0) { m--; ref.setMonth(ref.getMonth() - 1); days = Math.floor((n - ref) / 86400000) }
  return { months: m, days }
}

/**
 * Calculate Western constellation (星座) from birth date
 * @param {string} birthDate - YYYY-MM-DD format
 * @returns {string} Constellation name in Chinese
 */
function getConstellation(birthDate) {
  if (!birthDate) return ''
  const parts = birthDate.split('-')
  const m = parseInt(parts[1])
  const d = parseInt(parts[2])

  const boundaries = [
    [1, 20, '水瓶座'], [2, 19, '双鱼座'], [3, 21, '白羊座'],
    [4, 20, '金牛座'], [5, 21, '双子座'], [6, 22, '巨蟹座'],
    [7, 23, '狮子座'], [8, 23, '处女座'], [9, 23, '天秤座'],
    [10, 24, '天蝎座'], [11, 23, '射手座'], [12, 22, '摩羯座']
  ]

  for (let i = boundaries.length - 1; i >= 0; i--) {
    const [bm, bd, name] = boundaries[i]
    if (m > bm || (m === bm && d >= bd)) return name
  }
  return '摩羯座'
}

const CONSTELLATION_EMOJI = {
  '白羊座': '♈', '金牛座': '♉', '双子座': '♊', '巨蟹座': '♋',
  '狮子座': '♌', '处女座': '♍', '天秤座': '♎', '天蝎座': '♏',
  '射手座': '♐', '摩羯座': '♑', '水瓶座': '♒', '双鱼座': '♓'
}

function getConstellationEmoji(constellation) {
  return CONSTELLATION_EMOJI[constellation] || '⭐'
}

module.exports = { getZodiac, getAgeInMonths, getAgeInMonthsAndDays, getConstellation, getConstellationEmoji, ZODIAC }
