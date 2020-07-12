const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BankAccountsSchema = new Schema({
    userid : String,
    bankaccount:Object,
    created : {
        type : Date,
        default : Date.now
    },
})

module.exports = mongoose.model('bankaccount', BankAccountsSchema);