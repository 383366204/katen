const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId
    },
    region: {
        type: String,
        require:true
    },
    detail: {
        type: String,
        require:true
    },
    zipCode: {
        type: Number
    },
    name: {
        type: String,
        require:true
    },
    phone: {
        type: String,
        require:true
    },
    isDefault:{
        type: Boolean,
        require:true
    }
});

module.exports = mongoose.model('Address', AddressSchema);