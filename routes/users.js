const express = require('express');
const User = require('../models/user');
const Address = require('../models/address');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const router = express.Router();

require('../passport')(passport);

// 注册账户
router.post('/user/signup', (req, res) => {
  if ((!req.body.email && !req.body.phone) || !req.body.password) {
    res.json({
      success: false,
      message: '请输入您的账号密码.'
    });
  } else {
    var newUser = new User({
      nickName: req.body.nickName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password
    });
    // 保存用户账号
    newUser.save((err) => {
      if (err) {
        if (err.name == 'BulkWriteError') {
          return res.json({
            success: false,
            message: '手机号/邮箱号已存在!'
          });
        }
        return res.json({
          success: false,
          message: '注册失败!'
        });
      }
      res.json({
        success: true,
        message: '成功创建新用户!'
      });
    });
  }
});

// 检查用户名与密码并生成一个accesstoken如果验证通过
router.post('/user/signin', (req, res) => {
  var filter = {};
  // 若post过来的是邮箱，则用邮箱查询
  if (req.body.email) {
    filter = {email:req.body.email}
  }
  // 否则便用手机查询
  else if(req.body.phone){
    filter = {phone:req.body.phone}
  }
  User.findOne(filter, (err, user) => {
    if (err) {
      throw err;
    }
    if (!user) {
      res.json({
        success: false,
        message: '用户不存在!'
      });
    } else if (user) {
      // 检查密码是否正确
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          var token = jwt.sign(filter, config.secret, {
            expiresIn: 10080
          });
          user.token = token;
          user.save(function (err) {
            if (err) {
              res.send(err);
            }
          });
          res.json({
            success: true,
            message: '登录成功!',
            token: 'Bearer ' + token,
            nickName:user.nickName,
            level: user.level,
            email: user.email,
            phone: user.phone
          });
        } else {
          res.send({
            success: false,
            message: '密码错误!'
          });
        }
      });
    }
  });
});

// passport-http-bearer token 中间件验证
// 通过 header 发送 Authorization -> Bearer  + token
// 或者通过 ?access_token = token
router.get('/user/info',
  passport.authenticate('bearer', {
    session: false
  }),
  function (req, res) {
    console.log(req.user);
    res.json({
      nickName: req.user.nickName,
      email: req.user.email,
      phone: req.user.phone,
      email: req.user.email,
      address: req.user.address
    });
  });

// 新增地址
router.post('/user/address',
  passport.authenticate('bearer', {
    session: false
  }),
  function (req, res) {
    var newAddress = new Address({
      user:req.user._id,
      region: req.body.region,
      detail: req.body.detail,
      zipCode: req.body.zipCode,
      name: req.body.name,
      phone: req.body.phone,
      isDefault: req.body.isDefault
    });

    newAddress.save((err) => {
      if (err) {
        return res.json({
          success: false,
          message: '新建地址失败!'
        });
      }
      res.json({
        success: true,
        message: '新建地址成功!'
      });
    })
    
  });

  // 取得地址
router.get('/user/address',
passport.authenticate('bearer', {
  session: false
}),
function (req, res) {
  Address.find({user:req.user._id}).exec((err,address) => {
    if (err) {
      console.log(err);
    }
    else{
      res.json({
        success:true,
        address:address
      })
    }
  })
});
module.exports = router;