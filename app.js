App({
  onLaunch() {
    if (!wx.getStorageSync('babyProfile')) {
      wx.setStorageSync('babyProfile', null)
    }
  },

  globalData: {
    profile: null,
    playlist: []
  }
})
