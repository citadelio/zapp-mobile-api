const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BankAccountsSchema = new Schema({
    userid : String,
    accountname: String,
    bankcode: String,
    accountnumber: String,
    bankname: String,
    created : {
        type : Date,
        default : Date.now
    },
})

module.exports = mongoose.model('bankaccount', BankAccountsSchema);