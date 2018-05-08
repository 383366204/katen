module.exports = {
  secret: 'sunnstars', // used when we create and verify JSON Web Tokens
  database: 'mongodb://127.0.0.1:27017/test', // 填写本地自己 mongodb 连接地址,xxx为数据表名
  domain: ['http://127.0.0.1:8080','http://localhost:8080','http://127.0.0.1:9090','http://localhost:9090','http://funky.iok.la','http://www.91funky.com','http://www.91funky.com:4040','http://168h1b4258.imwork.net:48104','http://www.katen.com.cn:4040/'],
  emailConfig: {
    service: "qq",
    host: 'smtp.qq.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: '383366204@qq.com',
      pass: 'vpceskxprqnobicd'
    },
    proxy: 'http://127.0.0.1:1080'
  },
  emailSign:'开田商城<383366204@qq.com>',
  alipay:{
    app_id : '2016091500520178',
    notifyUrl: 'http://funky.iok.la/api/alipay',
    signType: 'RSA2',
    sandbox: true,
    gateway:'https://openapi.alipaydev.com/gateway.do?',
    return_url:'http://168h1b4258.imwork.net:48104/OrderSubmit'
  }
};