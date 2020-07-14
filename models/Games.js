const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GamesSchema = new Schema({
    name:String,
   gameCode: String,
   players: Array,
    created : {
        type : Date,
        default : Date.now
    },
    words : Array,
    status: {
        type: String,
        default:null
    },
    currentIndex: {
        type: Number,
        default:-1
    },
    currentWord: String,
})

module.exports = Games = mongoose.model('game', GamesSchema);