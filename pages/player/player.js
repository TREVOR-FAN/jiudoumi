const app = getApp()

Page({
  data: {
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    isLooping: true,
    currentItem: null,
    progress: 0,
    total: 0,
    audioContext: null,
    showVoicePanel: false,
    voiceSettings: {
      voiceName: 'auto',
      rate: 0.85,
      pitch: 1.1
    }
  },

  onLoad(options) {
    try {
      const vs = wx.getStorageSync('jiudoumi_voiceSettings')
      if (vs) this.setData({ voiceSettings: vs })
    } catch (e) { /* defaults */ }

    const startIndex = parseInt(options.index) || 0

    let playlist = app.globalData.playlist || []
    if (playlist.length === 0) {
      const item = {
        id: options.id || '',
        title: decodeURIComponent(options.title || ''),
        titleZh: decodeURIComponent(options.titleZh || ''),
        lyrics: decodeURIComponent(options.lyrics || ''),
        source: decodeURIComponent(options.source || '')
      }
      playlist = [item]
    }

    this.setData({
      playlist,
      currentIndex: Math.max(0, Math.min(startIndex, playlist.length - 1)),
      total: playlist.length
    })

    this.updateCurrentItem()
    wx.setNavigationBarTitle({ title: '九豆米 · 播放' })
  },

  onReady() {
    // Audio playback: wx.createInnerAudioContext() + remote MP3 URLs
    // Requires server.py deployed as cloud service for NetEase API proxy
  },

  onUnload() {
    if (this.audioContext) {
      this.audioContext.destroy()
      this.audioContext = null
    }
  },

  updateCurrentItem() {
    const item = this.data.playlist[this.data.currentIndex]
    if (!item) return
    this.setData({
      currentItem: item,
      progress: this.data.currentIndex
    })
  },

  togglePlay() {
    const newState = !this.data.isPlaying
    this.setData({ isPlaying: newState })
    if (newState) this.playCurrent()
  },

  playCurrent() {
    if (!this.data.isPlaying) return
    const item = this.data.playlist[this.data.currentIndex]
    if (!item) return
    const duration = (item.duration || 15) * 1000
    setTimeout(() => {
      if (!this.data.isPlaying) return
      this.advanceTrack()
    }, duration)
  },

  advanceTrack() {
    const { currentIndex, playlist, isLooping } = this.data
    if (currentIndex < playlist.length - 1) {
      this.setData({ currentIndex: currentIndex + 1 })
    } else if (isLooping) {
      this.setData({ currentIndex: 0 })
    } else {
      this.setData({ isPlaying: false })
      return
    }
    this.updateCurrentItem()
    if (this.data.isPlaying) this.playCurrent()
  },

  nextTrack() {
    const { currentIndex, playlist, isLooping } = this.data
    if (currentIndex < playlist.length - 1) {
      this.setData({ currentIndex: currentIndex + 1 })
    } else if (isLooping) {
      this.setData({ currentIndex: 0 })
    }
    this.updateCurrentItem()
    if (this.data.isPlaying) this.playCurrent()
  },

  prevTrack() {
    const { currentIndex, playlist, isLooping } = this.data
    if (currentIndex > 0) {
      this.setData({ currentIndex: currentIndex - 1 })
    } else if (isLooping) {
      this.setData({ currentIndex: playlist.length - 1 })
    }
    this.updateCurrentItem()
    if (this.data.isPlaying) this.playCurrent()
  },

  restartTrack() {
    if (this.data.isPlaying) this.playCurrent()
  },

  jumpToTrack(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ currentIndex: index })
    this.updateCurrentItem()
    this.setData({ isPlaying: true })
    this.playCurrent()
  },

  toggleLoop() {
    this.setData({ isLooping: !this.data.isLooping })
  },

  toggleVoicePanel() {
    this.setData({ showVoicePanel: !this.data.showVoicePanel })
  },

  onVoiceChange(e) {
    const vs = this.data.voiceSettings
    vs.voiceName = (e && e.detail && e.detail.value) || 'auto'
    this.setData({ voiceSettings: vs })
    wx.setStorageSync('jiudoumi_voiceSettings', vs)
  },

  onVoiceRateChange(e) {
    const vs = this.data.voiceSettings
    vs.rate = parseFloat((e && e.detail && e.detail.value) || 0.85)
    this.setData({ voiceSettings: vs })
    wx.setStorageSync('jiudoumi_voiceSettings', vs)
  },

  onVoicePitchChange(e) {
    const vs = this.data.voiceSettings
    vs.pitch = parseFloat((e && e.detail && e.detail.value) || 1.1)
    this.setData({ voiceSettings: vs })
    wx.setStorageSync('jiudoumi_voiceSettings', vs)
  }
})
