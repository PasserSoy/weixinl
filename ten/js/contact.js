const openDataContext = wx.getOpenDataContext()
openDataContext.postMessage({
  text: 'hello',
  year: (new Date()).getFullYear()
})