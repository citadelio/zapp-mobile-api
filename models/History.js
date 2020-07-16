const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HistorySchema = new Schema({
    userid : String,
    iswinner: Boolean,
    userpoint: Number,
    opponentpoint: Number,
    opponentname: String,
    created : {
        type:Date,
        default: Date.now
    },
})

module.exports = mongoose.model('history', HistorySchema);