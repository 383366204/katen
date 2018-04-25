const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    name: {
        type: String,
        require:true
    },
    phone:{
        type:Number,
        require:true
    },
    email:{
        type: String,
        require:true
    },
    qq:{
        type:Number
    },
    message:{
        type:String,
        require:true
    }
});

module.exports = mongoose.model('Message', MessageSchema);