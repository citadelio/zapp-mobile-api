const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GamesRandomSchema = new Schema({
    key:Number,
    mode:String,
   player: Object,
   opponent: Object,
   words : Array,
    created : {
        type : Date,
        default : Date.now
    },
})

module.exports = GamesRandom = mongoose.model('gameRandom', GamesRandomSchema);