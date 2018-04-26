const express = require('express');
const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const helper = require('../helper/helper');
const router = express.Router();
const fs = require('fs');
const multer = require('multer'); //上传中间件
const upload = multer(
  {
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        // 若文件夹不存在则创建
        fs.stat(__dirname + '/../static/productPic/'+req.body.name+'/',(err,stats) => {
          // console.log(stats);
          if (!stats) {
            fs.mkdir(__dirname + '/../static/productPic/'+req.body.name,err=>{
              if (err) {
                console.log(err);
              }
              cb(null, __dirname + '/../static/productPic/'+req.body.name);
            })
          }else{
            cb(null, __dirname + '/../static/productPic/'+req.body.name);
          }
        })
      },
      filename: function (req, file, cb) {
          cb(null, file.originalname)
      }
    })
  }
);


require('../passport')(passport);

// 新增商品
router.post('/', passport.authenticate('bearer', {
  session: false
}), (req, res) => {
  var product = new Product({
    grand: req.body.grand,
    category: req.body.category,
    name: req.body.name,
    tag: req.body.tag,
    size: req.body.size,
    packageSize: req.body.packageSize,
    power: req.body.power,
    weight: req.body.weight,
    price: req.body.price,
    property: req.body.property
  });
  // 保存商品
  product.save((err) => {
    if (err) {
      // console.log(err);
      if (err.name == 'BulkWriteError') {
        return res.json({
          success: false,
          message: '商品名称已存在'
        });
      }
      return res.json({
        success: false,
        message: '新增失败'
      });
    }
    res.json({
      success: true,
      message: '成功新增商品'
    });
  });
})

// 商品图片
router.post('/img',upload.array('productImg',4), passport.authenticate('bearer', {
  session: false
}), (req, res) => {
  res.json({
    success: true,
    message: '成功上传图片'
  })
})

module.exports = router;