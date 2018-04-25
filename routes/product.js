const express = require('express');
const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const helper = require('../helper/helper');
const router = express.Router();

require('../passport')(passport);

// 新增商品
router.post('/', passport.authenticate('bearer', {
  session: false
}), (req, res) => {
  console.log(req.body);
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
      console.log(err);
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


module.exports = router;