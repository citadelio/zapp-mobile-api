const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BanksSchema = new Schema({
    banks : Array,
    created : {
        type : Date,
        default : Date.now
    },
    updated : Date,
})

module.exports = mongoose.model('bank', BanksSchema);