const nodemailer = require('nodemailer');
const config = require('../config'); //引入配置文件
const axios = require('axios');
const Alipay = require('alipay-node-sdk'); //支付宝sdk
const path = require('path');
const multer = require('multer'); //上传中间件
const jwt = require('jsonwebtoken');
const fs = require('fs');

function getVerification(length) {
    let code = "";
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

function sendNotify(order) {
    let transporter = nodemailer.createTransport(config.emailConfig);
    let mailOptions = {
        from: config.emailSign,
        to: config.notifyEmail,
        subject: '订单发货提醒',
        text: `订单号：${order._id}\n付款金额：${order.price}\n收货地址：${order.address.region.split('/').join(' ')} ${order.address.detail}\n收货人：${order.address.name}\n联系电话：${order.address.phone}\n商品：\n${order.products.map(product=>(product.product.grand+product.product.category+product.product.name+' 数量：'+product.num)).join('\n')}\n留言：${order.message||'无'}`
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            return console.log(err);
        }
    })
}

// function sendNotifyToCustomer(order) {
//     return axios.post('https://api.sms.jpush.cn/v1/codes', {
//             mobile: order.address.phone,
//             temp_id: 1
//         }, {
//             headers: {
//                 'Authorization': 'Basic NDRjMDQ3YWRlNmRkMmZkZjUyZjhmOTY5OmExY2MzMDg4NGY0OWQwODQ1NGY4Yjc4Mw=='
//             }
//         })
//         .then(response => {
//             console.log(order);
//             return Promise.resolve(`您的订单已发货\n订单号：${order._id}\n付款金额：${order.price}\n收货地址：${order.address.region.split('/').join(' ')} ${order.address.detail}\n收货人：${order.address.name}\n联系电话：${order.address.phone}\n商品：\n${order.products.map(product=>(product.product.grand+product.product.category+product.product.name+' 数量：'+product.num)).join('\n')}\n留言：${order.message||'无'}`);
//         })
//         .catch(err => {
//             return Promise.reject(err.response)
//         });

// }

function sendEmail(to, verificationCode) {
    let transporter = nodemailer.createTransport(config.emailConfig);
    let mailOptions = {
        from: config.emailSign,
        to: to,
        subject: '邮箱验证',
        text: '你的验证码是：' + verificationCode
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            return console.log(err);
        }
    })
}

function sendPhone(to) {
    return axios.post('https://api.sms.jpush.cn/v1/codes', {
            mobile: to,
            temp_id: 1
        }, {
            headers: {
                'Authorization': 'Basic NDRjMDQ3YWRlNmRkMmZkZjUyZjhmOTY5OmExY2MzMDg4NGY0OWQwODQ1NGY4Yjc4Mw=='
            }
        })
        .then(response => {
            return Promise.resolve(response.data.msg_id);
        })
        .catch(err => {
            return Promise.reject(err.response)
        });
}

function veriPhoneCode(msgId, verification) {
    return axios.post(`https://api.sms.jpush.cn/v1/codes/${msgId}/valid`, {
            code: verification
        }, {
            headers: {
                'Authorization': 'Basic NDRjMDQ3YWRlNmRkMmZkZjUyZjhmOTY5OmExY2MzMDg4NGY0OWQwODQ1NGY4Yjc4Mw=='
            }
        })
        .then(response => {
            console.log('response');
            console.log(response.data);
            return Promise.resolve(response.data);
        })
        .catch((err) => {
            console.log('invalid');
            return Promise.reject(err.response.data);
        });
}

function getStorage() {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __dirname + '/../static/headPic/');
        },
        filename: function (req, file, cb) {
            let hashNum = jwt.sign({
                id: req.user_id
            }, config.secret);
            cb(null, `${hashNum}.png`)
        }
    })
}

function payByAlipay(orderInfo) {
    let outTradeId = Date.now().toString();
    // 公共参数设置
    let ali = new Alipay({
        appId: config.alipay.app_id,
        notifyUrl: config.alipay.notifyUrl,
        rsaPrivate: path.resolve(__dirname + '/keys/sandbox_private.pem'),
        rsaPublic: path.resolve(__dirname + '/keys/sandbox_ali_public.pem'),
        sandbox: config.alipay.sandbox,
        signType: config.alipay.signType
    });
    // 商品参数
    let params = ali.pagePay({
        subject: orderInfo.subject,
        body: orderInfo.body,
        outTradeId: outTradeId,
        timeout: '10m',
        amount: orderInfo.amount,
        goodsType: 2,
        qrPayMode: 2,
        return_url: config.alipay.upgrade_return_url,
        passbackParams: encodeURI(JSON.stringify(orderInfo))
    });

    let url = config.alipay.gateway + params;

    return url;

}

exports.getVerification = getVerification;
exports.sendEmail = sendEmail;
exports.sendPhone = sendPhone;
exports.veriPhoneCode = veriPhoneCode;
exports.payByAlipay = payByAlipay;
exports.getStorage = getStorage;
exports.sendNotify = sendNotify;
// exports.sendNotifyToCustomer = sendNotifyToCustomer;