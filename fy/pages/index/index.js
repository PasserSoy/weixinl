// pages/index/index.js
var _t;
var tk='';// 获取页面动态token
var md = require('../../js/md5');
var _h=[];// 历史记录
var ctx = wx.createCanvasContext('myCanvas');
var contHengY=30;// 内容横线纵坐标
var cir=[];// 圆坐标
Page({

  /**
   * 页面的初始数据
   */
  data: {
    val:'',//输入框默认值
    intShow:false,//历史记录是否显示
    screenWidth: '',//设备屏幕宽度
    cH: '900vh',//画布默认高度
    cH1: 0,//画布默认高度
    cShow: false,//画布active样式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _t=this;
    // _t.toImg();
    wx.getStorage({// 从缓存中取数据，初始化下拉框
      key:'_h',
      success(res){
        _h=res.data;
        _t.setData({
          history:_h
        });
      }
    });
    wx.request({// 获取页面动态token
      url:'https://www.so.com/s',
      data:{src:'360chrome_newtab_search',ie:'utf-8',q:'快递'},
      success(res){
        var token = /var extParams.*?\'(.*?)\'.*?\;/ig;
        var res;
        while((res= token.exec(res.data))!=null){
          tk=res[1];
        }
      }
    });
    wx.getSystemInfo({// 获取设备屏幕
      success(res){
        _t.setData({screenWidth:res.screenWidth});
        console.log(res.screenWidth)
      }
    });
  },
  search(nu){// 搜索
    // var nu = e.detail.value;
    var initParams = {
      'com': '',
      'nu': nu
    };
    var extParams = _t.getAjaxToken(initParams, tk);
    var url = 'https://open.onebox.so.com/api/getkuaidismart';
    var data = extParams;
    this.myAjax(url,data,function(res){
      console.log(res.data)
      if(res.data&&res.data.data&&res.data.data.data){
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
        var _hIndex = _h.map(x=>x.nu).indexOf(nu);// 数组中已存在该对象的下标
        var len = 5;// 数组最大长度
        // if(_h.map(x=>x.nu).indexOf(nu)<0) _h.unshift(pro);
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
        history:_h
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
      intShow:true
    })
  },
  intHide(){// 历史隐藏
    this.setData({
      intShow:false
    })
  },
  toInt(e){// 赋值到搜索框
    var nu = e.currentTarget.dataset.nu;
    _t.search(nu);
    this.setData({
      val:nu
    })
  },
  //canvas
  toImg() {
    if(_t.data.searchRes.errcode==0){
      var arr = _t.data.searchRes.data; 
      // _t.setData({cShow:true});
      console.log(arr)
      var fontSize=12;
      var fontColor='#999';
      var lineColor='#eee';
      var contColor='#333';// 结果颜色
      var allX=30;// 距离左边缘坐标
      var progX=allX/2;// 进度条坐标,圆心坐标
      var progR=allX/2-progX;// 进度条圆圈半径
      // var contHengY=30;// 内容横线纵坐标
      var sWidth=_t.data.screenWidth;//画布宽度
      var sPoint=sWidth/375;//像素点
      var a1=0;
      var a2=0;
      var contInterval=fontSize+8;// 内容的间隔
      // 背景
      ctx.clearRect(0, 0, sWidth, 100000000);
      contHengY=30;// 初始化
      cir=[];// 初始化

      ctx.setFillStyle('#fff');
      ctx.fillRect(0, 0, sWidth, 100000000);
      // 标题
      ctx.setFontSize(fontSize);
      ctx.setFillStyle(fontColor);
      ctx.fillText(arr.com_CN+' '+arr.nu,10,20);// 公司名
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
            if(i==0){
              ctx.setFillStyle('#20cf37');
            }
        ctx.fillText(x.time,allX,contHengY+contInterval);// 时间 与横线距离为contHengY+x

        cir.push(contHengY+contInterval-5);// 圆坐标
        
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
      console.log(cir[cir.length-1]+15+fontSize+contInterval)
      _t.setData({
        cH:cir[cir.length-1]+15+fontSize+contInterval+'px',
        cH1:cir[cir.length-1]+15+fontSize+contInterval
      });
      // ctx.draw();
      ctx.draw(false,function(){
        wx.canvasToTempFilePath({
          canvasId:'myCanvas',
          fileType:'jpg',
          width:sWidth,
          height:_t.data.cH1,
          success(res){
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath
            });
            _t.setData({
              file:res.tempFilePath,
              // cShow: false,//恢复画布默认高度
              // cH: '900vh',//恢复画布默认高度
            });
            console.log(res.tempFilePath)
          }
        });
      });
    }
  },
  drawText(str, initX, initY, lineHeight,sWidth) {
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
    
  }
})