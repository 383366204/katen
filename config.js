module.exports = {
  secret: 'sunnstars', // used when we create and verify JSON Web Tokens
  database: 'mongodb://localhost:27017/test', // 填写本地自己 mongodb 连接地址,xxx为数据表名
  domain: 'http://127.0.0.1:8080',
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
  emailSign:'多田商城<383366204@qq.com>'
};