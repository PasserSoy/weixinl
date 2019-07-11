//index.js
Page({
  data: {
  },
  onLoad: function () {
    console.log('yes')
  },
  toDetail:function(res){
    console.log(res)
    wx.navigateTo({
      url: '../detail/detail?num='+res.target.dataset.num
    });
  }
})
