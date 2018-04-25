const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InformSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        require:true
    },
    msgTitle:{
        type:String,
        require:true
    },
    msgContent:{
        type:String,
        require:true
    },
    date:{
        type:Date,
        default : Date.now
    }
});

module.exports = mongoose.model('Inform', InformSchema);