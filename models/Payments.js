const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentsSchema = new Schema({
  status:String,
  userid: String,
  txref: String,
  amount: String,
  paidat: String,
  channel: String,
  ip: String,
  customername: String,
  transactioncharge: String,
  authorization:Object,
  customer:Object,

});

module.exports =  mongoose.model("payment", PaymentsSchema);
