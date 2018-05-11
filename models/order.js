const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        require:true,
        ref:'User'
    },
    // status代表商品状态 1:待付款 2:待发货 3:待收货 :已完成 
    status:{
        type:Number,
        require:true,
        default:1
    },
    price:{
        type:Number,
        require:true
    },
    products:[{
        product:{
            type:Schema.Types.ObjectId,
            ref:'Product'
        },
        num:{
            type:Number,
            require:true
        }
    }],
    address:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Address'
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