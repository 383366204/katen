const express = require('express');
const Message = require('../models/message');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const helper = require('../helper/helper');
const router = express.Router();


require('../passport')(passport);

// 获取留言列表
router.get('/', passport.authenticate('bearer', {
    session: false
}), (req, res) => {
    Message.find({}).skip((req.query.currentPage - 1) * req.query.limit).limit(parseInt(req.query.limit)).sort({ '_id': -1 }).select('-__v').exec((err, resp) => {
        if (err) {
            console.log('err: ' + err);
        }
        Message.count({}, (err, count) => {
            res.json({
                success: true,
                message: '留言查询成功',
                message: resp,
                total: count
            })
        })
    })

})

// 新增留言
router.post('/', (req, res) => {
    var message = new Message({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        qq: req.body.qq,
        message: req.body.message
    });
    // 保存留言
    message.save((err) => {
        if (err) {
            console.log(err);
        }
        res.json({
            success: true,
            message: '成功提交留言'
        });
    });
})

// 删除留言
router.delete('/', passport.authenticate('bearer', {
    session: false
}), (req, res) => {
    Message.findByIdAndRemove(req.body._id, (err, resp) => {
        if (err) {
            res.json({
                success: true,
                message: '删除留言失败'
            })
        }
        else {
            res.json({
                success: true,
                message: '成功删除留言'
            })
        }
    })
})

module.exports = router;