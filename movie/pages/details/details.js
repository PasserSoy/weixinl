// pages/details/details.js
var _t;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _t=this;
    _t.init('https://m.douban.com/rexxar/api/v2/gallery/subject_feed',{start:0,count:4,subject_id:options.id,ck:null},function(res){
      console.log(res)
    });
  },
  init(url,data,callback){// 请求数据
    wx.request({
      url: url,
      data: data,
      header: { "Content-Type": "json" },
      dataType: 'json',
      success: function (res) {
        callback(res);
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})