const app = getApp()
const songs = require('../../data/songs')
const { getDailyRecommendations, getDailyTip } = require('../../utils/recommender')
const { getAgeInMonths, getAgeInMonthsAndDays, getZodiac, getConstellation, getConstellationEmoji } = require('../../utils/zodiac')

Page({
  data: {
    profile: null,
    hasProfile: false,
    babyName: '',
    ageMonths: 0,
    ageDays: 0,
    zodiac: '',
    zodiacEmoji: '',
    constellation: '',
    constellationEmoji: '',
    todayItems: [],
    todayDate: '',
    dailyTipText: '',
    dailyTipSource: ''
  },

  onLoad() {
    this.setData({ todayDate: this.formatToday() })
    this.loadRecommendations()
  },

  onShow() {
    const profile = wx.getStorageSync('babyProfile')
    if (profile && profile.birthDate) {
      profile.zodiac = getZodiac(profile.birthDate)
      wx.setStorageSync('babyProfile', profile)
    }
    this.loadRecommendations()
  },

  onPullDownRefresh() {
    this.loadRecommendations()
    wx.stopPullDownRefresh()
  },

  loadRecommendations() {
    const profile = wx.getStorageSync('babyProfile')
    const recs = getDailyRecommendations(
      (profile && profile.birthDate) ? profile : null,
      songs
    )

    const tip = getDailyTip()

    if (profile && profile.birthDate) {
      profile.zodiac = getZodiac(profile.birthDate)
      const ad = getAgeInMonthsAndDays(profile.birthDate)
      const constellation = getConstellation(profile.birthDate)
      this.setData({
        profile,
        hasProfile: true,
        babyName: profile.name || '宝宝',
        ageMonths: ad.months,
        ageDays: ad.days,
        zodiac: profile.zodiac,
        zodiacEmoji: this.getZodiacEmoji(profile.zodiac),
        constellation,
        constellationEmoji: getConstellationEmoji(constellation),
        todayItems: recs.items,
        dailyTipText: tip.text,
        dailyTipSource: tip.source
      })
    } else {
      this.setData({
        profile: null,
        hasProfile: false,
        babyName: '宝宝',
        ageMonths: 0,
        ageDays: 0,
        zodiac: '',
        zodiacEmoji: '',
        constellation: '',
        constellationEmoji: '',
        todayItems: recs.items,
        dailyTipText: tip.text,
        dailyTipSource: tip.source
      })
    }
  },

  onPlayAll() {
    app.globalData.playlist = this.data.todayItems
    wx.navigateTo({ url: '/pages/player/player?index=0' })
  },

  onPlay(e) {
    const { id } = e.currentTarget.dataset
    const index = this.data.todayItems.findIndex(i => i.id === id)
    if (index === -1) return
    app.globalData.playlist = this.data.todayItems
    wx.navigateTo({ url: `/pages/player/player?index=${index}` })
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  getZodiacEmoji(zodiac) {
    const map = {
      '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰',
      '龙': '🐲', '蛇': '🐍', '马': '🐴', '羊': '🐑',
      '猴': '🐵', '鸡': '🐔', '狗': '🐶', '猪': '🐷'
    }
    return map[zodiac] || '⭐'
  },

  formatToday() {
    const now = new Date()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekdays[now.getDay()]}`
  }
})
