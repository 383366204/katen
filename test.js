const fs = require('fs')
const Alipay = require('alipay-mobile')
const assert = require('assert');
const path = require('path');

const read = filename => {
  return fs.readFileSync(path.resolve(__dirname, filename))
}

//app_id: 开放平台 appid
//appPrivKeyFile: 你的应用私钥
//alipayPubKeyFile: 蚂蚁金服公钥
const options = {
  app_id: '2016091500520178',
  appPrivKeyFile: read('./keys/app_priv_key.pem'),
  alipayPubKeyFile: read('./keys/alipay_public_key.pem')
}

const service = new Alipay(options)
const data = {
  subject: '辣条',
  out_trade_no: '1232423',
  total_amount: '100'
}
const basicParams = {
  return_url: 'http://xxx.com'
}
return service.createPageOrderURL(data, basicParams)
.then(result => {
    console.log(result);
  assert(result.code == 0, result.message)
  assert(result.message == 'success', result.message)
})