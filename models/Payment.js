const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  userid: String,
  type:String,
  amount:Number,
  boostduration:Number,
  txref: String,
  flwref: String,
  paymentchannel: String,
  status:String,
  created:{
      type:Date,
      default:Date.now
  }
});

module.exports = Payment = mongoose.model("payment", PaymentSchema);
