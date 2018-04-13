const nodemailer = require('nodemailer');
const config = require('../config'); //引入配置文件
const axios = require('axios');

function getVerification(length) {
    let code = "";
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

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
            console.log(err);
            return Promise.reject(err);
        });
}

exports.getVerification = getVerification;
exports.sendEmail = sendEmail;
exports.sendPhone = sendPhone;
exports.veriPhoneCode = veriPhoneCode;