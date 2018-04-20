const express = require('express');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const helper = require('../helper/helper');
const router = express.Router();

require('../passport')(passport);

// 检查用户名与密码并生成一个accesstoken如果验证通过
router.post('/signin', (req, res) => {
  Admin.findOne({
    id: req.body.id
  }, (err, admin) => {
    if (err) {
      throw err;
    }
    if (!admin) {
      res.json({
        success: false,
        message: '管理员帐号不存在'
      });
    } else if (admin) {
      // 检查密码是否正确
      admin.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          var token = jwt.sign({
            id: req.body.id
          }, config.secret, {
            expiresIn: 10080
          });
          admin.token = token;
          admin.save(function (err) {
            if (err) {
              res.send(err);
            }
          });
          res.json({
            success: true,
            message: '登录成功',
            id: admin.id,
            level: admin.level,
            token: 'Bearer ' + token
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

router.post('/modify', passport.authenticate('bearer', {
  session: false
}), (req, res) => {
  console.log(req.body);
  // 先判断权限
  if (req.user.level == 0) {
    Admin.findOne({
      id: req.body.id
    }, (err, admin) => {
      if (err) {
        throw err;
      }
      if (!admin) {
        return res.json({
          success: false,
          message: '账户不存在'
        });
      } else if (admin) {
        // 检查密码是否正确
        admin.comparePassword(req.body.oldPassword, (err, isMatch) => {
          if (isMatch && !err) {
            admin.password = req.body.password
            admin.save(function (err) {
              if (err) {
                res.send(err);
              }
              else{
                return res.json({
                  success: true,
                  message: '修改成功',
                });
              }
            });
          } else {
            return res.send({
              success: false,
              message: '密码错误'
            });
          }
        });
      }
    })
  } else if (req.user.level == 1) {
    return res.json({
      success: false,
      message: '权限不足'
    });
  }
})

// 新增管理员
router.post('/signup', (req, res) => {
  if (!req.body.id || !req.body.password) {
    return res.json({
      success: false,
      message: '请输入您的账号密码'
    });
  } else {
    var newAdmin = new Admin({
      id: req.body.id,
      password: req.body.password
    });
    // 保存用户账号
    newAdmin.save((err) => {
      if (err) {
        console.log(err);
        if (err.name == 'BulkWriteError') {
          return res.json({
            success: false,
            message: '账号已存在'
          });
        }
        return res.json({
          success: false,
          message: '注册失败'
        });
      }
      res.json({
        success: true,
        message: '成功创建新管理员'
      });
    });
  }
});

router.get('/adminList',
  passport.authenticate('bearer', {
    session: false
  }),
  (req, res) => {
    if (req.user.level == 0) {
      Admin.find({}, '-_id id level')
        .exec((err, resp) => {
          return res.json({
            success: true,
            message: '获取管理员列表成功',
            adminList: resp
          });
        })
    } else if (req.user.level == 1) {
      return res.json({
        success: false,
        message: '权限不足'
      });
    }
  }
)

router.delete('/adminList', passport.authenticate('bearer', {
  session: false
}), (req, res) => {
  if (req.user.level == 0) {
    Admin.findOneAndRemove({
      id: req.body.id
    }, (err, resp) => {
      if (err) {
        console.log(err);
        res.json({
          success: false,
          message: '删除失败'
        })
      } else {
        res.json({
          success: true,
          message: '删除管理员成功'
        });
      }
    })
  } else if (req.user.level == 1) {
    return res.json({
      success: false,
      message: '权限不足'
    });
  }
})


module.exports = router;