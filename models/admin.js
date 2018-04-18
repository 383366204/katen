const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const AdminSchema = new Schema({
    id: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        require: true
    },
    token: {
        type: String
    }
});

// 添加用户保存时中间件对password进行bcrypt加密,这样保证用户密码只有用户本人知道
AdminSchema.pre('save', function (next) {
    var admin = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(admin.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                admin.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// 更新用户时中间件对password进行bcrypt加密,这样保证用户密码只有用户本人知道
AdminSchema.pre('findOneAndUpdate', function (next) {
    var admin = this;
    if (this._update.password) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(admin._update.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                admin._update.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// 校验用户输入密码是否正确
AdminSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

AdminSchema.static('comparePassword',function (passw,admin,cb) {
    bcrypt.compare(passw, admin.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
})

module.exports = mongoose.model('Admin', AdminSchema);