const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    grand: {
        type: String,
        require:true
    },
    category: {
        type: String,
        require:true
    },
    name: {
        type: String,
        require:true,
        unique:true
    },
    tag: [{
        type: String
    }],
    size: {
        type: String
    },
    packageSize:{
        type: String
    },
    power:{
        type:String
    },
    weight:{
        type:String
    }
    ,
    price:{
        type:Number,
        require:true
    },
    property:[{
        proName:{type:String},
        proValue:{type:String}
    }],
    sales:{
        type:Number,
        default:0
    }
});

module.exports = mongoose.model('Product', ProductSchema);