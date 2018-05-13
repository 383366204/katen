const express = require('express');
const Inform = require('../models/inform');
const config = require('../config');
const passport = require('passport');
const helper = require('../helper/helper');
const router = express.Router();

require('../passport')(passport);

router.get('/',
  passport.authenticate('bearer', {
    session: false
  }),
  (req, res) => {
    Inform.find({user:req.user._id},(err,resp) => {
        if (err) {
            console.log(err);
            res.json({
                success:false,
                message:'通知查询失败'
            })
        } else {
            res.json({
                success:true,
                message:'通知查询成功',
                informs:resp
            })
        }
    })
  }
)


module.exports = router;