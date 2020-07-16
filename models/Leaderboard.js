const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeaderboardSchema = new Schema({
    userid : String,
    name: String,
    avatar: String,
    wins: Number,
    created : Number,
})

module.exports = mongoose.model('leaderboard', LeaderboardSchema);