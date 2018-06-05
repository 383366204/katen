const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;

const User = require('./models/user');
const Admin = require('./models/admin')
const config = require('./config');

//FIXME 判断的方法需要改进
module.exports = function(passport) {
    passport.use(new Strategy(
        function(token, done) {
            User.findOne({
                token: token
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    Admin.findOne({
                        token:token
                    },function (err,admin) {
                        if(err){
                            return done(err)
                        }
                        if (!admin) {
                            return done(null, false);
                        }
                        if (admin) {
                            return done(null,admin);
                        }
                    })
                }
                else if(user){
                    return done(null, user);
                }
            });
        }
    ));
};
