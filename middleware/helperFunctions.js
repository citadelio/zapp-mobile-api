const TransactionModel = require("../models/Transaction");
const AdvertModel = require("../models/Advert");
// const BankdataModel = require("../models/Bankdata");
const FLW_calls = require("./FLW_calls");
const uuid = require('uuid')


module.exports = {
  prettyCurrency: amount => {
    const formatter = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2
    });
    const convertedAmount = formatter.format(amount);
    return convertedAmount;
  },
  makeTitleCase: str => {
    return str
      .toLowerCase()
      .split(" ")
      .map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  },
  createUsername : name => {
        let randomId = uuid().split('-')[1].toLowerCase();
        let username = name.split(' ')[0].toLowerCase();
        return [username,randomId].join('-')
  },
  getBoostAmount : duration => {
    let amount;
    switch(duration){
      case 1: amount =  process.env.BOOST1AMOUNT;break;
      case 7: amount =  process.env.BOOST2AMOUNT;break;
      case 15: amount =  process.env.BOOST3AMOUNT;break;
      case 30: amount =  process.env.BOOST4AMOUNT;break;
      default: amount = 0;
    }
    return parseInt(amount);
  },
  verifyPayment: async (txref, transaction, txtype) => {
    const payload = {
      txref,
      SECKEY: process.env.FLW_SECRET_KEY
    };
    const response = await FLW_calls.verifyPayment(payload);
    const resp = response.data;
    console.log(resp)
    if (response) {
      //save to transaction collection
      const newTransaction = new TransactionModel({
        paymentId: transaction._id,
        txid: resp.txid,
        txref,
        newtxref: resp.txref,
        txtype: txtype,
        amount: resp.amount,
        chargedAmount: resp.chargedamount,
        transactionCharge: resp.appfee,
        amountSettled: resp.amountsettledforthistransaction,
        ip: resp.ip,
        narration: resp.narration,
        status: resp.status,
        paymenttype: resp.paymenttype,
        paymentid: resp.paymentid,
        created: resp.created,
        customerId: resp.customerid,
        customerPhone: resp.custphone,
        customerName: resp.custname,
        customerEmail: resp.custemail,
        customerCreated: resp.custcreated,
        cardType: resp.card?resp.card.type: "BANK",
        raveRef: resp.raveref,
      });
      const savedTransaction = await newTransaction.save();

      let paymentStatus = resp.status,
        chargeResponsecode = resp.chargecode,
        chargeAmount = resp.amount;

      if (
        (chargeResponsecode == "00" || chargeResponsecode == "0") &&
        chargeAmount == transaction.amount
      ) {
        return savedTransaction;
      } else {
        return false;
      }
    }
    return false;
  },
  boostCheck : async () => {
    console.log("herere")
    try{
        const allAds = await AdvertModel.find()
                                        .where('boostpoint').gt(0)
        allAds.map(async singleAd=>{
          const upd = await AdvertModel.updateOne({_id:singleAd._id},{
            boostpoint: parseInt(singleAd.boostpoint) - 1
          })
        })
        console.log(allAds.length + " Ads Updated on " + new Date())
    }catch(err){
      console.log("Could not reset boost ads on " + new Date())
    }
}
};
