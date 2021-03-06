const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const UserSchema = new Schema({
    nickName: {
        type: String
    },
    level: {
        type: Number,
        default: 1
    },
    levelTime:{
        type:Date,
        default : Date.now
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        require: true
    },
    headPicUrl:{
        type:String,
        default:'/headPic/default.png'
    },
    token: {
        type: String
    }
});

// 添加用户保存时中间件对password进行bcrypt加密,这样保证用户密码只有用户本人知道
UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt,null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// 更新用户时中间件对password进行bcrypt加密,这样保证用户密码只有用户本人知道
UserSchema.pre('findOneAndUpdate', function (next) {
    var user = this;
    if (this._update.password) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user._update.password, salt,null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user._update.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// 校验用户输入密码是否正确
UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

UserSchema.static('comparePassword',function (passw,user,cb) {
    bcrypt.compare(passw, user.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
})

module.exports = mongoose.model('User', UserSchema);