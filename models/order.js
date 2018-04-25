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
    address:{
        type:Schema.Types.ObjectId,
        required:true
    }
});

module.exports = mongoose.model('Order', OrderSchema);