const express = require('express');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const config = require('../config');
// const passport = require('passport');
const helper = require('../helper/helper');
const router = express.Router();

// require('../adminPass')(passport);

// 检查用户名与密码并生成一个accesstoken如果验证通过
router.post('/signin', (req, res) => {
  Admin.findOne({id:req.body.id}, (err, admin) => {
    if (err) {
      throw err;
    }
    if (!admin) {
      res.json({
        success: false,
        message: '管理员不存在'
      });
    } else if (admin) {
      // 检查密码是否正确
      admin.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          var token = jwt.sign(filter, config.secret, {
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
            id:admin.id,
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

module.exports = router;