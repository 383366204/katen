const express = require('express');
const User = require('../models/user');
const Address = require('../models/address');
const Inform = require('../models/inform');
const Order = require('../models/order');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const helper = require('../helper/helper');
const router = express.Router();
const multer = require('multer'); //上传中间件
const upload = multer({
  storage: helper.getStorage()
});

require('../passport')(passport);

// 注册账户
router.post('/user/signup', (req, res, next) => {
  // 判断有没有验证码
  if (!req.body.verification) {
    return res.json({
      success: false,
      message: '验证码为空'
    });
  } else {
    if ((!req.body.email && !req.body.phone) || !req.body.password) {
      return res.json({
        success: false,
        message: '请输入您的账号密码'
      });
    }
    // 比对邮箱验证码
    else if (req.body.email) {
      if (req.body.verification != req.session.verificationE) {
        return res.json({
          success: false,
          message: '验证码错误'
        });
      } else {
        next();
      }
    } else if (req.body.phone) {
      helper.veriPhoneCode(req.session.verificationP, req.body.verification)
        .then(success => {
          console.log('success');
          if (success) {
            next();
          }
        })
        .catch(err => {
          console.log(err);
          return res.json({
            success: false,
            message: '验证码错误'
          });
        });
    }
  }
}, (req, res) => {
  let newUser = new User({
    nickName: req.body.nickName,
    email: req.session.email,
    phone: req.session.phone,
    password: req.body.password
  });
  // 保存用户账号
  newUser.save((err,user) => {
    if (err) {
      if (err.name == 'BulkWriteError') {
        return res.json({
          success: false,
          message: '手机号/邮箱已存在'
        });
      }
      return res.json({
        success: false,
        message: '注册失败'
      });
    }else{
      res.json({
        success: true,
        message: '成功创建新用户'
      });
      // 注册成功后增加一条通知
      let inform = new Inform({
        user:user._id,
        msgTitle:'账号注册成功',
        msgContent:'您好，欢迎您注册本商城的账号'
      })
      inform.save((err) => {
        if (err) {
          console.log(err);
        }
      })
    }
    // 注册完后清除session
    req.session.destroy();
  });
});

// 检查用户名与密码并生成一个accesstoken如果验证通过
router.post('/user/signin', (req, res) => {
  var filter = {};
  // 若post过来的是邮箱，则用邮箱查询
  if (req.body.email) {
    filter = {
      email: req.body.email
    }
  }
  // 否则便用手机查询
  else if (req.body.phone) {
    filter = {
      phone: req.body.phone
    }
  }
  User.findOne(filter, (err, user) => {
    if (err) {
      throw err;
    }
    if (!user) {
      res.json({
        success: false,
        message: '用户不存在'
      });
    } else if (user) {
      // 检查密码是否正确
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          var token = jwt.sign(filter, config.secret, {
            expiresIn: 10080
          });
          user.token = token;

          // 判读会员是否已过期
          if (user.level == 2) {
            let levelTime = parseInt(Math.abs(new Date(user.levelTime) - new Date()) / 1000 / 60 / 60 / 24);
            if (levelTime <= 0) {
              user.level = 1;
            }
          }

          user.save(function (err) {
            if (err) {
              res.send(err);
            }
          });
          res.json({
            success: true,
            message: '登录成功',
            token: 'Bearer ' + token,
            nickName: user.nickName,
            level: user.level,
            email: user.email,
            phone: user.phone,
            levelTime: user.levelTime,
            headPicUrl: user.headPicUrl
          });
        } else {
          res.send({
            success: false,
            message: '密码错误'
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
    res.json({
      success: true,
      message: '获取用户信息成功',
      nickName: req.user.nickName,
      email: req.user.email,
      phone: req.user.phone,
      email: req.user.email,
      address: req.user.address,
      level:req.user.level,
      levelTime: req.user.levelTime,
      headPicUrl: req.user.headPicUrl
    });
  });

// 更改user信息
router.post('/user/info',
  passport.authenticate('bearer', {
    session: false
  }),
  function (req, res, next) {
    req.session.updateData = {};

    // 若有nickNam直接加入到要更新的数据里
    if (req.body.nickName) {
      req.session.updateData.nickName = req.body.nickName;
      next();
    }

    // 验证密码(若是有oldPassword证明要修改其他信息,若是有password证明要修改密码)
    else if (req.body.oldPassword) {
      User.comparePassword(req.body.oldPassword, req.user, (err, isMatch) => {
        // 若有错误则返回
        if (err || !isMatch) {
          console.log('password err');
          return res.json({
            success: false,
            message: '密码错误'
          });
        }
        // 若没有错误则将密码加入更新数据中
        if (req.body.password) {
          req.session.updateData.password = req.body.password;
          next();
        }

        // 当有邮箱时，比对邮箱验证码
        if (req.body.email) {
          // 若发现验证码不一致则返回
          if (req.body.verification != req.session.verificationE) {
            return res.json({
              success: false,
              message: '验证码错误'
            });
          }
          // 若没有错误则将邮箱加入更新数据中
          if (req.body.email) {
            req.session.updateData.email = req.session.email;
            next();
          }
        }
        if (req.body.phone) {
          helper.veriPhoneCode(req.session.verificationP, req.body.verification)
            .then(success => {
              console.log('success');
              if (success) {
                req.session.updateData.phone = req.session.phone;
                next();
              }
            })
            .catch(err => {
              console.log(err);
              return res.json({
                success: false,
                message: '验证码错误'
              });
            });
        }
      })
    }
  }, (req, res) => {
    // 若有多个属性同时更新，阻止
    if (Object.keys(req.session.updateData).length != 1) {
      req.session.destroy();
      return res.json({
        success: false,
        message: '更新属性异常'
      });
    }
    User.findByIdAndUpdate(req.user._id, req.session.updateData, {
      new: true,
      select: '-_id level nickName email phone levelTime headPicUrl'
    }, (err, user) => {
      if (err) {
        if (err.name == 'MongoError') {
          res.json({
            success: false,
            message: '手机号/邮箱已存在'
          });
        }
        console.log(err);
      } else {
        res.json({
          success: true,
          message: '修改成功',
          user: {
            nickName: user.nickName || '',
            email: user.email || '',
            phone: user.phone || '',
            level: user.level,
            levelTime: user.levelTime,
            headPicUrl: user.headPicUrl
          }
        });
        // 清除session
        req.session.destroy();
      }
    });

  });


// 忘记密码
router.post('/user/forget', (req, res) => {
  // 判断有没有验证码
  if (!req.body.verification) {
    return res.json({
      success: false,
      message: '验证码为空'
    });
  }
  // 对比邮箱验证码
  if (req.body.email && req.body.verification != req.session.verificationE) {
    return res.json({
      success: false,
      message: '验证码错误'
    });
  }
  let filter = {};
  // 若post过来的是邮箱，则用邮箱查询
  if (req.body.email) {
    filter = {
      email: req.body.email
    }
  }
  // 否则便用手机查询
  else if (req.body.phone) {
    filter = {
      phone: req.body.phone
    }
  }
  User.findOneAndUpdate(filter, {
    password: req.body.password
  }, {
    new: true
  }, (err, user, resp) => {
    if (err) {
      console.log(err);
    }
    if (!user) {
      return res.json({
        success: false,
        message: '用户不存在'
      });
    } else if (user) {
      // 消除session
      req.session.destroy();
      return res.json({
        success: true,
        message: '密码修改成功'
      });
    }
  });
})

// 获取验证码
router.put('/user/verification', (req, res) => {
  // 邮箱验证
  if (req.body.email) {
    // 将email储存在session中
    req.session.email = req.body.email;
    // 设置验证码
    req.session.verificationE = helper.getVerification(6);

    res.json({
      success: true,
      message: '已发送验证码'
    })
    req.session.save();
    //发送邮件
    helper.sendEmail(req.session.email, req.session.verificationE);
  }
  // 手机验证
  else if (req.body.phone) {
    // 将电话储存在session中
    req.session.phone = req.body.phone;
    // 设置验证码
    helper.sendPhone(req.session.phone)
      .then((msgId) => {
        req.session.verificationP = msgId;
        res.json({
          success: true,
          message: '已发送验证码'
        })
        req.session.save();
      })
      .catch(err => console.log(err))
  }
})

// 新增地址
router.post('/user/address',
  passport.authenticate('bearer', {
    session: false
  }),
  function (req, res) {
    var newAddress = new Address({
      user: req.user._id,
      region: req.body.region,
      detail: req.body.detail,
      zipCode: req.body.zipCode,
      name: req.body.name,
      phone: req.body.phone,
      isDefault: req.body.isDefault
    });

    // 若设为默认，则将数据库里面的其他地址设为不默认
    if (req.body.isDefault) {
      Address.update({
        user: req.user._id
      }, {
        isDefault: false
      }, {
        multi: true
      }, (err, raw) => {
        if (err) {
          console.log(err);
        }
      })
    }
    newAddress.save((err, address) => {
      if (err) {
        return res.json({
          success: false,
          message: '新建地址失败'
        });
      }
      res.json({
        success: true,
        message: '新建地址成功',
        address: {
          _id: address._id,
          region: address.region,
          detail: address.detail,
          zipCode: address.zipCode || '',
          name: address.name,
          phone: address.phone,
          isDefault: address.isDefault
        }
      });
    })

  });

// 删除地址
router.delete('/user/address',
  passport.authenticate('bearer', {
    session: false
  }),
  function (req, res) {
    Address.findByIdAndRemove(req.body._id, (err, remData) => {
      if (err) {
        return res.json({
          success: false,
          message: '删除地址失败'
        });
      }
      //如果删除了默认地址，则将最新添加的一条地址设为默认地址
      if (remData.isDefault) {
        Address.findOneAndUpdate({
          user: req.user._id
        }, {
          isDefault: true
        }, {
          sort: {
            '_id': -1
          }
        }, (err, doc, res) => {
          if (err) {
            console.log(err);
          }
        })
      }
      res.json({
        success: true,
        message: '删除地址成功'
      });
    })
  });

// 修改地址
router.put('/user/address',
  passport.authenticate('bearer', {
    session: false
  }),
  function (req, res, next) {
    // 若是put过来的设为默认地址，则将数据库里其他地址设为非默认
    if (req.body.isDefault) {
      Address.update({
        user: req.user._id
      }, {
        isDefault: false
      }, {
        multi: true
      }, (err, raw) => {
        if (err) {
          console.log(err);
        } else {
          next();
        }
      })
    }
  }, (req, res) => {
    let updateData = {
      name: req.body.name,
      region: req.body.region,
      detail: req.body.detail,
      zipCode: req.body.zipCode,
      phone: req.body.phone,
      isDefault: req.body.isDefault,
    }

    Address.findByIdAndUpdate(req.body._id, {
      $set: updateData
    }, {
      select: 'name region detail zipCode phone isDefault'
    }, (err, address) => {
      //  若将默认地址改为非默认地址，将最新一条设为默认
      if (address.isDefault == true && req.body.isDefault == false) {
        Address.findOneAndUpdate({
          user: req.user._id
        }, {
          isDefault: true
        }, {
          sort: {
            '_id': -1
          }
        }, (err, doc, res) => {
          if (err) {
            console.log(err);
          }
        })
      }

      if (err) {
        console.log(err);
      } else {
        res.json({
          success: true,
          message: '修改信息成功'
        });
      }
    });
  });

// 取得地址
router.get('/user/address',
  passport.authenticate('bearer', {
    session: false
  }),
  function (req, res) {
    Address.find({
      user: req.user._id
    }, 'region detail zipCode name phone isDefault').sort({
      '_id': -1
    }).exec((err, address) => {
      if (err) {
        console.log(err);
      } else {
        res.json({
          success: true,
          address: address
        })
      }
    })
  });

// 升级为超级会员
router.post('/user/upgrade',
  passport.authenticate('bearer', {
    session: false
  }),
  function (req, res) {

    let days = req.body.upgradeDays;
    let levelTime = new Date(new Date(req.user.levelTime).valueOf() + days * 24 * 60 * 60 * 1000);

    // 账单信息
    let orderInfo = {};
    orderInfo.userId = req.user._id;
    // orderType为1时是充值订单
    orderInfo.orderType = 1;
    orderInfo.levelTime = levelTime;

    //金额 
    if (days == 30) {
      orderInfo.amount = 20;
    } else if (days == 180) {
      orderInfo.amount = 90;
    } else if (days == 360) {
      orderInfo.amount = 120;
    }
    //主题
    orderInfo.subject = '开田商城超级会员充值';
    //副题
    orderInfo.body = '购买' + days + '天超级会员'

    // 支付宝支付
    if (req.body.payOption == 0) {
      res.json({
        success: true,
        url: helper.payByAlipay(orderInfo)
      });
    }

  });


// 更改头像
router.post('/user/headPic',
  passport.authenticate('bearer', {
    session: false
  }),
  upload.single('avatar'),
  function (req, res) {

    let hashNum = jwt.sign({
      id: req.user_id
    }, config.secret);

    User.findByIdAndUpdate(req.user._id, {
      headPicUrl: '/headPic/' + hashNum + '.png'
    }, {
      new: true,
      select: '-_id level nickName email phone levelTime headPicUrl'
    }, (err, user) => {
      if (err) {
        res.json({
          success: false,
          message: '更换头像失败'
        });
        console.log(err);
      } else {
        res.json({
          success: true,
          message: '更换头像成功',
          user: {
            nickName: user.nickName || '',
            email: user.email || '',
            phone: user.phone || '',
            level: user.level,
            levelTime: user.levelTime,
            headPicUrl: user.headPicUrl
          }
        });
        // 清除session
        req.session.destroy();
      }
    });
  });

// 支付宝回调接口
router.post('/alipay', (req, res) => {
  let orderInfo = JSON.parse(decodeURI(req.body.passback_params));
  console.log(orderInfo);

  // orderType为1时是充值订单
  if (orderInfo.orderType == 1) {
    User.findByIdAndUpdate(orderInfo.userId, {
      level: 2,
      levelTime: orderInfo.levelTime
    }, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        res.send('success');
      }
    })
  }

  // orderType为2时是商品订单
  else if (orderInfo.orderType == 2) {
    Order.findByIdAndUpdate(orderInfo._id,{status:2},(err,resp) => {
      if (err) {
        console.log(err);
      } else {

         // 付款成功后增加一条通知
         let inform = new Inform({
            user: orderInfo.user,
            msgTitle: '订单提交成功',
            msgContent: '您好，您的订单'+ orderInfo._id +'已经提交成功'
          });

          inform.save((err) => {
              if (err) {
                  console.log(err);
              }
          })

        res.send('success');
      }
    })
  }

})

module.exports = router;