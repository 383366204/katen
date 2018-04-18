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
        require:true
    },
    tag: [{
        type: String,
        unique: true,
        sparse: true
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
        type:Number
    }
    ,
    price:{
        type:Number,
        require:true
    },
    imgUrl:{
        type:String,
        require:true,
        default:'/productPic/default.png'
    },
    property:[{
        proName:{type:String,unique:true,sparse: true},
        proValue:{type:String}
    }],
    salse:{
        type:Number,
        default:0
    }
});

module.exports = mongoose.model('Product', ProductSchema);