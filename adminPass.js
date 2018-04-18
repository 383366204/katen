const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;

const Admin = require('./models/admin');
const config = require('./config');

module.exports = function(passport) {
    passport.use(new Strategy(
        function(token, done) {
            Admin.findOne({
                token: token
            }, function(err, admin) {
                if (err) {
                    return done(err);
                }
                if (!admin) {
                    return done(null, false);
                }
                return done(null, admin);
            });
        }
    ));
};
