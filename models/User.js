const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    userid : String,
    email : String,
    avatar : Object,
    wallet : {
        type: Number,
        default:0,
    },
    authType : {
        type : String,
        required : true
    },
    created : {
        type : Date,
        default : Date.now
    },
    role:String,
    bottype:String,
    

})

module.exports = User = mongoose.model('user', UserSchema);