const nodemailer = require('nodemailer');
const config = require('../config');//引入配置文件

function getVerification(length) {
    let code = "";
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

function sendEmail(to,verificationCode) {
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

exports.getVerification = getVerification;
exports.sendEmail = sendEmail;