const express = require('express');
const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const helper = require('../helper/helper');
const router = express.Router();
const fs = require('fs');
const multer = require('multer'); //上传中间件
const path = require('path');
const util = require('util');
const stat = util.promisify(fs.stat);
const upload = multer(
  {
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        // 若文件夹不存在则创建
        stat(__dirname + '/../static/productPic/' + req.body.name + '/')
        .then(response=>{
          cb(null, __dirname + '/../static/productPic/' + req.body.name);
        })
        .catch(err=>{
          fs.mkdir(__dirname + '/../static/productPic/' + req.body.name, err => {
            if (err) {
              console.log(err);
            }
            cb(null, __dirname + '/../static/productPic/' + req.body.name);
          })
        })
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname)
      }
    })
  }
);

require('../passport')(passport);

// 获取商品列表
router.get('/', (req, res) => {
  console.log(req.query);
  let searchFilter = new RegExp(req.query.searchFilter, 'i');
  let filter = {};

  if (req.query.searchFilter) {
    if (!req.query.selectFilter) {
      filter = {
        $or: [
          { 'grand': searchFilter },
          { 'category': searchFilter },
          { 'name': searchFilter },
          { 'tag': searchFilter },
          { 'property.proValue': searchFilter }
        ]
      }
    }
    else {
      switch (req.query.selectFilter) {
        case 'grand':
          filter['grand'] = searchFilter;
          break;
        case 'category':
          filter['category'] = searchFilter;
          break;
        case 'name':
          filter['name'] = searchFilter;
          break;
        case 'tag':
          filter['tag'] = searchFilter;
          break;
        case 'property':
          filter['property.proValue'] = searchFilter
            ;
          break;
        default:
          break;
      }
    }
  }

  Product.find(filter).skip((req.query.currentPage - 1) * req.query.limit).limit(parseInt(req.query.limit)).sort({ '_id': -1 }).select('-_id -__v').exec((err, resp) => {
    if (err) {
      console.log('err: ' + err);
    }
    Product.count(filter, (err, count) => {
      res.json({
        success: true,
        message: '商品查询成功',
        product: resp,
        total: count
      })
    })
  })
})

// 获取单个商品
router.get('/detail', (req, res) => {
  Product.findOne({name:req.query.name}).select('-__v').exec((err,resp) => {
    if (err) {
      console.log(err);
    }else{
      res.json({
        success: true,
        message: '商品查询成功',
        product: resp
      })
    }
  })
})

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

// 删除商品
router.delete('/', passport.authenticate('bearer', {
  session: false
}), (req, res) => {
  Product.deleteOne({name:req.body.name},(err) => {
    if (err) {
      res.json({
        success: false,
        message: '删除商品失败' 
      })
    }
    else{
      let directory = './static/productPic/'+req.body.name+'/'
      // 商品删除的同时把图片也删除
      fs.readdir(directory, (err, files) => {
        if (err) {
          console.log(err);
        }
        else{
          for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
              if (err) throw err;
            });
          }
        }
      });

      res.json({
        success: true,
        message: '删除商品成功' 
      })
    }
  })
})

// 修改商品
router.put('/', passport.authenticate('bearer', {
  session: false
}), (req, res) => {
  let updateData = {
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
  }
  Product.findOneAndUpdate({name:req.body.oldName},updateData, {
    new: true,
    select: '-_id grand category name tag size packageSize power weight price property sales'
  },(err,product) => {
    if (err) {
      if (err.name == 'MongoError') {
        res.json({
          success: false,
          message: '商品名称已存在'
        });
      }
      console.log('err',err);
    }
    else{
      if (req.body.oldName!=req.body.name) {
        fs.rename('./static/productPic/'+req.body.oldName+'/','./static/productPic/'+req.body.name+'/',(err) => {
          if (err) {
            console.log(err);
          }
        })
      }
      res.json({
        success:true,
        message:'商品更新成功',
        product:product
      })
    }
  })
})

// 获取商品图片
router.get('/img', (req, res) => {
  console.log(req.query);
  Product.findOne({name:req.query.name},(err,resp) => {
    if (err) {
      console.log(err);
    }
    if (resp) {
      fs.readdir('./static/productPic/'+req.query.name+'/',(err,files) => {
        if (err) {
          res.json({
            success: false,
            message: '商品没有上传图片',
          })
        }
        else{
          res.json({
            success: true,
            message: '成功获取商品图片',
            fileList: files
          })
        }
      })
    }else{
      res.json({
        success: false,
        message: '商品不存在',
      })
    }
  })
})

// 上传商品图片
router.post('/img', upload.array('productImg', 4), passport.authenticate('bearer', {
  session: false
}), (req, res) => {
  res.json({
    success: true,
    message: '成功上传图片'
  })
})

// 删除商品图片
router.delete('/img', passport.authenticate('bearer', {
  session: false
}), (req, res) => {
  fs.unlink('./static/productPic/'+req.body.name+'/'+req.body.fileName,(err) => {
    if (err) {
      res.json({
        success: false,
        message: '删除图片失败'
      })
    }
    else{
      res.json({
        success: true,
        message: '成功删除图片'
      })
    }
  })
})

module.exports = router;