const express = require('express');
const Order = require('../models/order');
const User = require('../models/user');
const Inform = require('../models/inform');
const passport = require('passport');
const helper = require('../helper/helper');
const router = express.Router();
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
    var order = new Order({
        user: req.user._id,
        price: req.body.price,
        products: req.body.products,
        address: req.body.address,
        message: req.body.message
    });
    // 保存商品
    order.save((err, order) => {
        console.log(order);
        if (err) {
            console.log(err);
            res.json({
                success: false,
                message: '订单提交失败'
            });
        } else {
            let orderInfo = {};
            orderInfo._id = order._id;
            // orderType为2时是购买订单
            orderInfo.orderType = 2;
            orderInfo.amount = order.price;
            //主题
            orderInfo.subject = '开田商城购买订单';
            //副题
            orderInfo.body = '购买商品';
            res.json({
                success: true,
                message: '订单提交成功',
                url: helper.payByAlipay(orderInfo)
            });

            // 注册成功后增加一条通知
            let inform = new Inform({
                user: req.user._id,
                msgTitle: '订单提交成功',
                msgContent: '您好，您的订单' + order._id + '已经提交成功'
            });

            inform.save((err) => {
                if (err) {
                    console.log(err);
                }
            })

        }
    });
})

// 订单付款
router.post('/pay', passport.authenticate('bearer', {
    session: false
}), (req, res) => {
    Order.findById(req.body._id, (err, resp) => {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                message: '订单付款失败'
            })
        }
        else {
            let orderInfo = {};
            orderInfo._id = resp._id;
            orderInfo.user = req.user._id;
            // orderType为2时是购买订单
            orderInfo.orderType = 2;
            orderInfo.amount = resp.price;
            //主题
            orderInfo.subject = '开田商城购买订单';
            //副题
            orderInfo.body = '购买商品'

            res.json({
                success: true,
                message: '订单付款提交',
                url: helper.payByAlipay(orderInfo)
            });

        }
    })
})

// 删除订单
router.delete('/', passport.authenticate('bearer', {
    session: false
}), (req, res) => {
    Order.findOneAndRemove({
        _id: req.body._id,
        user: req.user.id
    }, (err, resp) => {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                message: '订单删除失败'
            })
        } else {
            res.json({
                success: true,
                message: '订单删除成功'
            })
        }
    })

})

// 客户确认收货
router.put('/', passport.authenticate('bearer', {
    session: false
}), (req, res) => {
    Order.findOneAndUpdate({
        _id: req.body._id
    }, { status: 4 }, {
            new: true,
            // select: '-_id grand category name tag size packageSize power weight price property sales'
        }, (err, order) => {
            if (err) {
                console.log('err', err);
            } else {
                res.json({
                    success: true,
                    message: '确认收货成功'
                })
                // '确认收货成功后增加一条通知
                let inform = new Inform({
                    user: req.user._id,
                    msgTitle: '确认收货成功',
                    msgContent: '您好，您的订单'+ order._id +'已经确认收货'
                });

                inform.save((err) => {
                    if (err) {
                        console.log(err);
                    }
                })
            }
    })
})

// 管理员获取订单
router.get('/admin', passport.authenticate('bearer', {
    session: false
}), async (req, res) => {
    let searchFilter = req.query.searchFilter;
    let filter = {};

    if (req.query.searchFilter) {

        switch (req.query.selectFilter) {
            case '_id':
                filter['_id'] = searchFilter;
                break;
            case 'status': {
                let status = ['', '待付款', '待发货', '待收货', '已完成'];
                filter['status'] = status.findIndex(value => value == searchFilter);
            }
                break;
            case 'user': {
                let userFilter;
                let isEmail = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
                if (isEmail.test(searchFilter)) {
                    userFilter = { email: searchFilter }
                } else {
                    userFilter = { phone: searchFilter }
                }
                console.log(userFilter);
                await User.findOne(userFilter, (err, user) => {
                    if (err) {
                        console.log(err);
                    } else if (user) {
                        filter['user'] = user._id;
                    } else {
                        return res.json({
                            success: false,
                            message: '订单查询失败'
                        })
                    }
                })
            }
                break;
            default:
                break;
        }

    }
    Order.find(filter).skip((req.query.currentPage - 1) * req.query.limit).limit(parseInt(req.query.limit))
        .sort({
            '_id': -1
        }).select('-__v -products._id').populate('user address products.product', '-password -token -headPicUrl -levelTime -_id -_v').exec((err, resp) => {
            if (err) {
                console.log('err: ' + err);
                return res.json({
                    success: false,
                    message: '订单查询失败'
                });
            } else {
                Order.count(filter, (err, count) => {
                    return res.json({
                        success: true,
                        message: '商品查询成功',
                        order: resp,
                        total: count
                    })
                })
            }
        })
})

// 管理员删除订单
router.delete('/admin', passport.authenticate('bearer', {
    session: false
}), (req, res) => {
    Order.findOneAndRemove({
        _id: req.body._id,
    }, (err, resp) => {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                message: '订单删除失败'
            })
        } else {
            res.json({
                success: true,
                message: '订单删除成功'
            })
        }
    })
})

// 管理员发货
router.put('/admin', passport.authenticate('bearer', {
    session: false
}), (req, res) => {
    console.log(req.body);
    Order.findOneAndUpdate({
        _id: req.body._id
    }, { status: 3 }, (err, order) => {
        if (err) {
            console.log('err', err);
        } else {
            res.json({
                success: true,
                message: '发货成功'
            })

            // '发货成功后增加一条通知
            let inform = new Inform({
                user: order.user,
                msgTitle: '商品发货成功',
                msgContent: '您好，您的订单'+ order._id +'已经发货成功'
            });

            inform.save((err) => {
                if (err) {
                    console.log(err);
                }
            })
        }
    })
})

module.exports = router;