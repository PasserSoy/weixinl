// pages/index/index.js
var _t;var rooturl='https://movie.douban.com/j/';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isnull:false,//查询结果是否为空
    top:0,// 滚动条高度
    scrollam:false,// 开启滚动条动画
    result:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {//初始化赋值
    _t = this;
    _t.loadinit();
  },
  search(e){// 查询
    _t.setData({top:0})
    _t.init('subject_suggest',{ q: e.detail.value },function(res){
      res=res.data;
      if(res.length==0){// 查询结果为空
        _t.loadinit();
        _t.setData({ isnull:true });
        if(e.detail.value=='') _t.setData({ isnull:false });
      }else{
        _t.setData({ result: res,isnull:false });
      };
    });
  },
  loadinit(){// 初始化请求
    _t.init('search_subjects',{type:'movie',tag:'热门',page_start:0,page_limit:50},function(res){
      res.data.subjects.map(x=>{
        x.img=x.cover;
        delete x.cover;
      });
      _t.setData({ result: res.data.subjects });
    });
  },
  init(url,data,callback){// 请求数据
    _t.setData({isnull:false});
    wx.request({
      url: rooturl+url,
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
  navTo(e){// 跳转页面
    var id=e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/details/details?id='+id
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
