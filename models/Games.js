const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GamesSchema = new Schema({
   gameCode: String,
   players: Array,
    created : {
        type : Date,
        default : Date.now
    }

})

module.exports = Games = mongoose.model('game', GamesSchema);