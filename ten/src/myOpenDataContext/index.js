wx.onMessage(data => {
  console.log(data)
  /* {
    text: 'hello',
    year: 2018
  } */
})
wx.getUserInfo({
  success:function(res){
    console.log(res)
  }
})