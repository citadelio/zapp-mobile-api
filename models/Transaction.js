const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  paymentId: String,
  receiverId: String,
  txid: Number,
  txref: String,
  newtxref: String,
  txtype: String,
  amount: Number,
  chargedAmount: Number,
  transactionCharge: Number,
  amountSettled: Number,
  ip: String,
  narration: String,
  status: String,
  paymenttype: String,
  paymentid: Number,
  created: Date,
  customerId: Number,
  customerPhone: String,
  customerName: String,
  customerEmail: String,
  customerCreated: Date,
  cardType: String,
  raveRef: String,
});

module.exports = Transaction = mongoose.model("transaction", TransactionSchema);
