const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GamePinsSchema = new Schema({
    name:String,
    gameCode: String,
    creator: String,
    created : {
        type : Date,
        default : Date.now
    },
    start:{
        type:Boolean,
        default: false
    }
})

module.exports = mongoose.model('gamepin', GamePinsSchema);