const { getZodiac, getAgeInMonths, getAgeInMonthsAndDays, getConstellation, getConstellationEmoji } = require('../../utils/zodiac')

Page({
  data: {
    name: '',
    birthDate: '',
    gender: 'boy',
    zodiac: '',
    zodiacEmoji: '',
    constellation: '',
    constellationEmoji: '',
    ageMonths: 0,
    ageDays: 0,
    hasProfile: false,
    todayDate: ''
  },

  onShow() {
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    this.setData({ todayDate: todayStr })

    const profile = wx.getStorageSync('babyProfile')
    if (profile) {
      const zodiac = getZodiac(profile.birthDate)
      const constellation = getConstellation(profile.birthDate)
      const ad = getAgeInMonthsAndDays(profile.birthDate)
      this.setData({
        name: profile.name || '',
        birthDate: profile.birthDate || '',
        gender: profile.gender || 'boy',
        zodiac,
        zodiacEmoji: this.getZodiacEmoji(zodiac),
        constellation,
        constellationEmoji: getConstellationEmoji(constellation),
        ageMonths: ad.months,
        ageDays: ad.days,
        hasProfile: true
      })
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onDateChange(e) {
    const birthDate = e.detail.value
    const zodiac = getZodiac(birthDate)
    const constellation = getConstellation(birthDate)
    const ad = getAgeInMonthsAndDays(birthDate)
    this.setData({
      birthDate,
      zodiac,
      zodiacEmoji: this.getZodiacEmoji(zodiac),
      constellation,
      constellationEmoji: getConstellationEmoji(constellation),
      ageMonths: ad.months,
      ageDays: ad.days
    })
  },

  onGenderChange(e) {
    this.setData({ gender: e.detail.value })
  },

  saveProfile() {
    const { name, birthDate, gender, zodiac } = this.data

    if (!name.trim()) {
      wx.showToast({ title: '请输入宝宝的名字', icon: 'none' })
      return
    }
    if (!birthDate) {
      wx.showToast({ title: '请选择宝宝的生日', icon: 'none' })
      return
    }

    wx.setStorageSync('babyProfile', {
      name: name.trim(),
      birthDate,
      gender,
      zodiac
    })
    this.setData({ hasProfile: true })

    wx.showToast({ title: '保存成功', icon: 'success', duration: 1500 })
    setTimeout(() => { wx.switchTab({ url: '/pages/home/home' }) }, 1500)
  },

  getZodiacEmoji(zodiac) {
    const map = {
      '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰',
      '龙': '🐲', '蛇': '🐍', '马': '🐴', '羊': '🐑',
      '猴': '🐵', '鸡': '🐔', '狗': '🐶', '猪': '🐷'
    }
    return map[zodiac] || '⭐'
  }
})
