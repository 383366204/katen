const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    product:[{
        type: Schema.Types.ObjectId,
        require:true
    }],
    type:{
        type:Number,
        default:0
    }
});

module.exports = mongoose.model('Order', OrderSchema);