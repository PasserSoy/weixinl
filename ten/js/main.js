let ctx = canvas.getContext('2d');
let _sw = canvas.width,// 屏幕宽度
    _gameS = _sw-30,// 游戏区域高宽
    _sh = canvas.height,// 屏幕高度
    _residueH = _sh-_gameS,// 屏幕剩余高度
    _bk = '#eee';// 背景色
// 绘制图片
let huaji = wx.createImage();
huaji.src = 'img/hj.png';

function render(){// 绘制前都要清空整张页面
  // 绘制背景
  ctx.clearRect(0, 0,_sw,_sh);// 绘制前先清空
  ctx.fillStyle = _bk;
  ctx.fillRect(0, 0, _sw, _sh);
  // 绘制游戏区域
  ctx.fillStyle = 'teal';
  ctx.fillRect(15, 45, _gameS, _gameS);
  // 绘制结果区域
  if(wx.getStorageSync('minTime')) resArea(ctx,_gameS,wx.getStorageSync('minTime'));
  // 绘制说明区域
  ctx.fillStyle = '#333';
  ctx.font = "14px Arial";
  ctx.fillText( '点击开始后，图片会出现在随机位置', 15, _gameS+110 );
  ctx.fillText( '出现的瞬间，点击图片，测试反应时间', 15, _gameS+130 );

}
// 绘制游戏区域
gameArea(ctx,_gameS);
function gameArea(ctx,w,time=0,msg='点击开始'){// 绘制游戏区域
  render();
  ctx.fillStyle = '#ffffff';
  ctx.font = "20px Arial";
  ctx.fillText( msg, w/2-26, w/2+30 );
  ctx.font = "14px Arial";
  const fontWidth = Math.floor(ctx.measureText('耗时：' + time+' ms').width/2);
  ctx.fillText( '耗时：' + time+' ms', _sw/2-fontWidth, w/2+60 );
  wx.onTouchStart(function(e){
    let _XY = e.touches[0];
    if(_XY.pageX>15 && _XY.pageX<(w+15) && _XY.pageY>45 && _XY.pageY<(w+45)){
      console.log('begin');
      wx.offTouchStart();
      beginGame(ctx,w);
    };
  });
}
function beginGame(ctx,w){// 游戏开始
  render();
  var randomTime = Math.floor((Math.random()*3+1)*1000);// 随机时间
  var sT = new Date().getTime();// 游戏开始时间戳
  var toPlay=true;
  wx.onTouchStart(function(e){// 还没开始就点击
    let _XY = e.touches[0];
    if(_XY.pageX>15 && _XY.pageX<(w+15) && _XY.pageY>45 && _XY.pageY<(w+45)){
      wx.offTouchStart();
      var eT = new Date().getTime();// 玩家开始点击时间戳
      if((eT-sT)<randomTime){
        console.log('游戏还没开始');
        toPlay=false;
        gameArea(ctx,_gameS,0,'点太快了');
      };
    };
  });
  setTimeout(() => {// 随机开始游戏
    if(toPlay==true){
      render();
      console.log(randomTime+'游戏进行中');
      // 随机绘制点
      let imgX = Math.floor((Math.random()*(_gameS-huaji.width))+1)+15,// 图片的随机x坐标
      imgY = Math.floor((Math.random()*(_gameS-huaji.height))+1)+45;// 图片的随机y坐标
      if(imgX>=_sw-110 && imgY<=80){// 如果坐标位于按钮上时,将图标下移
        imgY=100;
      };
      ctx.drawImage(huaji, imgX, imgY);
      var startTime = new Date().getTime();// 开始显示图标时的时间戳
      var finalTime = 0;// 计算耗时
      wx.offTouchStart();
      wx.onTouchStart(function (p) {// 点击滑稽触发结算
        let _imgXY = p.touches[0];
        if(_imgXY.pageX>imgX && _imgXY.pageX<(imgX+huaji.width) && _imgXY.pageY>imgY && _imgXY.pageY<(imgY+huaji.height)){
          console.log('游戏结束');
          var endTime = new Date().getTime();// 点击图标时的时间戳
          finalTime = endTime-startTime;// 耗时
          gameArea(ctx,w,finalTime);
          let minTime =wx.getStorageSync('minTime');
          if(minTime){// 如果为最小值，则更新
            if(finalTime<=minTime){
              resArea(ctx,w,finalTime);
              wx.setStorageSync('minTime', finalTime);
            };     
          }else{
            wx.setStorageSync('minTime', finalTime);
            resArea(ctx,w,finalTime); 
          };
        };
      });
    };
  }, randomTime);
}
function resArea(ctx,w,time){// 绘制结果区域  
  ctx.clearRect(15, w+45, w, 30);// 绘制前先清空
  ctx.fillStyle = _bk;
  ctx.fillRect(15, w+45, w, 30);
  ctx.fillStyle = '#333';
  ctx.font = "14px Arial";
  ctx.fillText( '最好成绩: ' + time+' ms', 15, w+70 );
}
