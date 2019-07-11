// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  return await request('https://www.so.com/s?src=360chrome_newtab_search&ie=utf-8&q=快递',function(res){
    return res
  })
}