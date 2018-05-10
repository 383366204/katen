const express = require('express');
const Order = require('../models/order');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const helper = require('../helper/helper');
const router = express.Router();
const fs = require('fs');
const util = require('util');
require('../passport')(passport);

// 用户获取订单
router.get('/', passport.authenticate('bearer', {
    session: false
}), (req, res) => {

    let filter = {
        user: req.user._id
    };
    // 如果有带status就在参数里加上
    if (req.query.status) {
        filter.status = req.query.status
    }


    Order.find(filter).skip((req.query.currentPage - 1) * req.query.limit).limit(parseInt(req.query.limit))
        .sort({
            '_id': -1
        }).select('-__v -products._id').populate('address products.product', '-_id -_v').exec((err, resp) => {
            if (err) {
                console.log('err: ' + err);
                res.json({
                    success: false,
                    message: '订单查询失败'
                });
            } else {
                Order.count(filter, (err, count) => {
                    res.json({
                        success: true,
                        message: '商品查询成功',
                        order: resp,
                        total: count
                    })
                })
            }
        })
})

// 新增订单
router.post('/', passport.authenticate('bearer', {
    session: false
}), (req, res) => {
    console.log(req.body);
    var order = new Order({
        user: req.user._id,
        price: req.body.price,
        products: req.body.products,
        address: req.body.address,
        message: req.body.message
    });
    // 保存商品
    order.save((err) => {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                message: '订单提交失败'
            });
        } else {
            res.json({
                success: true,
                message: '订单提交成功'
            });
        }
    });
})

// 删除订单
router.delete('/', passport.authenticate('bearer', {
    session: false
}), (req, res) => {
    Order.findOneAndRemove({_id:req.body._id,user:req.user.id},(err,resp) => {
        if (err) {
            console.log(err);
            res.json({
                success:false,
                message: '订单删除失败'
            })
        } else {
            res.json({
                success:true,
                message:'订单删除成功'
            })
        }
    })

})

// 修改订单
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
    Product.findOneAndUpdate({
        name: req.body.oldName
    }, updateData, {
        new: true,
        select: '-_id grand category name tag size packageSize power weight price property sales'
    }, (err, product) => {
        if (err) {
            if (err.name == 'MongoError') {
                res.json({
                    success: false,
                    message: '商品名称已存在'
                });
            }
            console.log('err', err);
        } else {
            if (req.body.oldName != req.body.name) {
                fs.rename('./static/productPic/' + req.body.oldName + '/', './static/productPic/' + req.body.name + '/', (err) => {
                    if (err) {
                        console.log(err);
                    }
                })
            }
            res.json({
                success: true,
                message: '商品更新成功',
                product: product
            })
        }
    })
})

// 管理员获取订单
router.get('/admin', passport.authenticate('bearer', {
    session: false
}), (req, res) => {

    let filter = {
        // user: req.user._id
    };
    // 如果有带status就在参数里加上
    // if (req.query.status) {
    //     filter.status = req.query.status
    // }


    Order.find(filter).skip((req.query.currentPage - 1) * req.query.limit).limit(parseInt(req.query.limit))
        .sort({
            '_id': -1
        }).select('-__v -products._id').populate('address products.product', '-_id -_v').exec((err, resp) => {
            if (err) {
                console.log('err: ' + err);
                res.json({
                    success: false,
                    message: '订单查询失败'
                });
            } else {
                Order.count(filter, (err, count) => {
                    res.json({
                        success: true,
                        message: '商品查询成功',
                        order: resp,
                        total: count
                    })
                })
            }
        })
})


module.exports = router;