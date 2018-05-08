const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        require:true
    },
    // status代表商品状态 1:待付款 2:待发货 3:待收货 :已完成 
    status:{
        type:Number,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    product:[{
        name:{type:String,require:true},    
    }],
    address:{
        type:Schema.Types.ObjectId,
        required:true
    },
    message:{
        type:String
    },
    date:{
        type:Date,
        default : Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);