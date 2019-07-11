// pages/index/index.js
var _t;
var md = require('../../js/md5');
var _h=[];// 历史记录
var ctx = wx.createCanvasContext('myCanvas');
var contHengY=30;// 内容头上的横线纵坐标
var cir=[];// 圆心坐标
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadEnd:'',//初始化页面 隐藏搜索框，显示loading
    val:'',//输入框默认值
    searchintH:90,// 搜索面板高度
    screenWidth: '',//设备屏幕宽度
    cH: 100,//画布默认高度
    cShow: true,//画布显隐
    kdName:'Express'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _t=this;
    wx.getStorage({// 从缓存中取数据，初始化下拉框
      key:'_h',
      success(res){
        _h=res.data;
        _t.setData({
          history:_h
        });
      }
    });
    _t.getTk();// 设置tk
    wx.getSystemInfo({// 获取设备屏幕
      success(res){
        _t.setData({screenWidth:res.screenWidth});
      }
    });
    // wx.request({// 二维码
    //   url:'https://api.weixin.qq.com/cgi-bin/token',
    //   data:{grant_type:'client_credential',appid:'wxbf139526ed5288e3',secret:'b34b0fd9171cd573e1ccab6f000d0e50'},
    //   success(res){
    //     var _key = res.data.access_token;
    //     wx.request({
    //       url:'https://api.weixin.qq.com/wxa/getwxacode?access_token='+_key,
    //       data:{path:'/pages/index/index',width:280,auto_color:true},
    //       method:'post',
    //       responseType: 'arraybuffer',
    //       success(res){
    //         // console.log(res.data)
    //         // console.log()
    //         _t.setData({
    //           acode:'data:image/png;base64,'+wx.arrayBufferToBase64(res.data)
    //         });
    //       }
    //     })
    //   }
    // })
    if(options.nu){// 转发时的查询
      _t.setData({val:options.nu});
      _t.search(options.nu)
    }
  },
  getTk(){// 获取tk
    // 日期变化 修改缓存 这样就能每天只请求一次，将token存入缓存中
    var today = new Date().toLocaleDateString();// 今天的日期
    if(wx.getStorageSync('time')!=today || wx.getStorageSync('tk')==''){
      wx.setStorageSync('time',today);// 将日期存入缓存中
      _t.setData({loadEnd:''});// 隐藏搜索框，显示loading
      wx.request({// 获取页面动态token
        url:'https://www.so.com/s',
        data:{src:'360chrome_newtab_search',ie:'utf-8',q:'快递'},
        success(res){
          var token = /var extParams.*?\'(.*?)\'.*?\;/ig;
          var res;
          _t.setData({loadEnd:'loadEnd'});// 显示搜索框，隐藏loading
          while((res= token.exec(res.data))!=null){
            wx.setStorageSync('tk',res[1]);// 将token存入缓存中
          }
        }
      });
    }else{// 已经存在正确的tk
      _t.setData({loadEnd:'loadEnd'});// 显示搜索框，隐藏loading
    };
  },
  search(nu){// 搜索
    _t.setData({
      remove:false // 遮盖搜索结果
    });
    wx.pageScrollTo({
      scrollTop:0,
      duration:0
    });
    // var nu = e.detail.value;
    var initParams = {
      'com': '',
      'nu': nu
    };
    var extParams = _t.getAjaxToken(initParams, wx.getStorageSync('tk'));
    var url = 'https://open.onebox.so.com/api/getkuaidismart';
    var data = extParams;
    this.myAjax(url,data,function(res){
      // console.log(res.data)
      if(res.data&&res.data.data&&res.data.data.data){// 处理手机号
        var telreg=/\d{11}/ig;
        res.data.data.data.forEach(x=>{
          x.context=x.context.replace(/(<a.*?>|<\/a>)/ig,'');//移除a标签
          x.tel=x.context.match(telreg)?x.context.match(telreg)[0]:'';// 获取手机号
        })
      };
      // 历史记录
      if(nu!=''){// 单号不为空时
        var pro = {nu:nu};// 插入的对象
        if(res.data&&res.data.data&&res.data.data.com_CN){
          pro.company=res.data.data.com_CN;
        }else{
          pro.company="未知公司";
        }
        _t.setData({kdName:pro.company})
        var _hIndex = _h.map(x=>x.nu).indexOf(nu);// 数组中已存在该对象的下标
        var len = 5;// 数组最大长度
        if(_hIndex>-1){// 将原有的删除
          _h.splice(_hIndex,1);
        };
        _h.unshift(pro);// 将新对象插入数组中
        if(_h.length>len){// 超过最大长度，删除过多数据
          _h.splice(len);
        };
        wx.setStorage({// 本地历史搜索数组
          key:'_h',
          data:_h
        });
      };
      _t.setData({
        searchRes:res.data,
        history:_h,
        remove:true, // 遮盖搜索结果
      });
    });
  },
  myAjax(url,data,callback){// 数据请求
    wx.showLoading({
      title:'正在查询ing...'
    });
    wx.request({
      url:url,
      data:data,
      dataType:'json',
      header:{'content-type':'json'},
      success(res){
        callback(res);
      },
      complete(){
        wx.hideLoading();
      }
    })
  },
  getAjaxToken(params, auth_key){// token
    /*首先，给params增加time属性*/
    params.time = Math.floor((new Date).getTime() / 1000);
    /*生成token：将params按key的字母顺序排列，拼成字符串，生成md5*/
    var keys = [];
    for (var i in params) {
        keys.push(i);
    }
    keys = keys.sort();
    var params_str = '';
    for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];
        params_str += key + params[key];
    }
    params_str += auth_key;
    params.token = md.md5(params_str);
    return params;
  },
  call(e){// 拨打电话
    var tel = e.currentTarget.dataset.tel;
    if(tel!=''){
      wx.makePhoneCall({
        phoneNumber:tel
      })
    }
  },
  intserh(e){// 输入框查询
    _t.search(e.detail.value);
  },
  intShow(){// 历史显示
    this.setData({
      searchintH:(_h.length)*60 + 90, // 搜索面板高度
    })
  },
  intHide(){// 历史隐藏
    this.setData({
      searchintH:90, // 搜索面板高度
    })
  },
  toInt(e){// 赋值到搜索框
    var nu = e.currentTarget.dataset.nu;
    _t.search(nu);
    this.setData({
      searchintH:90,
      val:nu
    });
  },
  //canvas
  toImg() {// 绘图
    wx.showLoading({
      title:'正在保存图片...'
    });
    if(_t.data.searchRes.errcode==0){
      var arr = _t.data.searchRes.data;// 需要绘图的数据
      _t.setData({cShow:false});// 绘制开始显示画布
      var fontSize=12;
      var fontColor='#999';// 标题颜色
      var lineColor='#eee';
      var contColor='#333';// 内容颜色
      var allX=30;// 距离左边缘坐标
      var progX=allX/2;// 进度条坐标,圆心坐标
      var sWidth=_t.data.screenWidth;//画布宽度
      // var sPoint=sWidth/375;//像素点
      var contInterval=fontSize+8;// 内容的间隔
      // 背景
      ctx.clearRect(0, 0, sWidth, 100000000);
      contHengY=30;// 内容头上的横线纵坐标初始化
      cir=[];// 圆心坐标初始化
      ctx.setFillStyle('#fff');
      ctx.fillRect(0, 0, sWidth, 100000000);
      //./标题
      arr.data.forEach((x,i)=>{
        // contHengY += fontSize;// 更新坐标为 加上内容高度
        // 内容头上的横线
        ctx.beginPath();
        ctx.moveTo(allX, contHengY);
        ctx.lineTo(sWidth-20, contHengY);
        ctx.lineWidth=1;
        ctx.strokeStyle=lineColor;
        ctx.stroke();
        // 内容
        ctx.setFontSize(fontSize);
        ctx.setFillStyle(contColor);
        if(i==0){// 第一个内容颜色区别
          ctx.setFillStyle('#20cf37');
        }
        ctx.fillText(x.time,allX,contHengY+contInterval);// 时间 与横线距离为contHengY+x

        cir.push(contHengY+contInterval-5);// 圆心坐标
        
        _t.drawText(x.context,allX,contHengY+2*contInterval,18,sWidth-20);// 内容
      });
      // 描进度条
      // 描线
      ctx.beginPath();
      ctx.moveTo(progX, cir[0]);
      ctx.lineTo(progX, cir[cir.length-1]);
      ctx.lineWidth=1;
      ctx.strokeStyle=lineColor;
      ctx.stroke();
      //描圈
      cir.forEach((x,i)=>{
        ctx.beginPath();
        ctx.arc(progX, x, 5, 0, 2 * Math.PI);
        ctx.setFillStyle(lineColor);
        if(i==0){
          ctx.setFillStyle('#20cf37');
        };
        ctx.fill();
        ctx.beginPath();
        ctx.arc(progX, x, 7, 0, 2 * Math.PI);
        ctx.lineWidth=5;
        ctx.strokeStyle="#fff";
        ctx.stroke();
      });
      var _cH = cir[cir.length-1]+15+fontSize+contInterval;// canvas的高度
      // 标题 避免被内容颜色污染
      ctx.setFontSize(fontSize);
      ctx.setFillStyle(fontColor);
      ctx.fillText(arr.com_CN+' '+arr.nu,10,20);// 公司名
      // 描二维码
      // ctx.drawImage('../../js/acode.png', progX, _cH-110, 100, 100);
      // ctx.setFontSize(fontSize);
      // ctx.setFillStyle(fontColor);
      // ctx.fillText('长按识别图中的小程序码',progX+110,_cH-110+50+fontSize/2);// 在图片中间位置
      _t.setData({
        cH:_cH
      });
      // 定时器避免保存空白图片
      var interval = setTimeout(x=>{
        ctx.draw(false,function(){
          wx.canvasToTempFilePath({
            canvasId:'myCanvas',
            fileType:'jpg',
            width:sWidth,
            height:_t.data.cH,
            success(res){
              clearInterval(interval);
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                complete(){
                  wx.hideLoading();
                  console.log('save done!')
                }
              });
              _t.setData({
                file:res.tempFilePath,// 生成的canvas路径
                cShow:true,// 绘制结束隐藏画布
              });
            }
          });
        });
      },2000);
    }
  },
  drawText(str, initX, initY, lineHeight,sWidth) {// 绘图中切割文字换行
    var lineWidth = 0;
    var canvasWidth = sWidth;
    var lastSubStrIndex = 0;
    for (let i = 0; i < str.length; i++) {
      lineWidth += ctx.measureText(str[i]).width;
      if (lineWidth > canvasWidth - initX) { //减去initX,防止边界出现的问题
        ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
        initY += lineHeight;
        contHengY = initY+10;
        lineWidth = 0;
        lastSubStrIndex = i;
      }else{// 没换行
        contHengY=initY+10;
      }
      if (i == str.length - 1) {
        ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
      }
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var title = _t.data.kdName+'\n'+_t.data.val;
    return {
      title:title,
      path:'/pages/index/index?nu='+_t.data.val,
      imageUrl:'/img/acode.png'
    }
  },
  refresh(){// 刷新
    wx.setStorageSync('tk','')
    _t.getTk();
    // var stop = setInterval(x=>{
    //   if(wx.getStorageSync('tk')!=''){
    //     wx.stopPullDownRefresh({
    //       complete(){
    //         _t.setData({loadEnd:'loadEnd'});// 显示搜索框，隐藏loading
    //       }
    //     });
    //     clearInterval(stop);
    //   };
    // },1);
  },
  scanCode(){// 扫码
    wx.scanCode({
      success(res){
        if(res.errMsg=="scanCode:ok"){
          _t.setData({
            val:res.result
          });
          _t.search(res.result);//查询
        }else{
          wx.showToast({title:res.errMsg})
        }
      }
    })
  }
})