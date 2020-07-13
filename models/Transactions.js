const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionsSchema = new Schema({
  userid: String,
  method:String,
  amount:String,
  txref: String,
  status:String,
  type:String,
  created:{
      type:Date,
      default:Date.now
  }
});

module.exports = mongoose.model("transaction", TransactionsSchema);
