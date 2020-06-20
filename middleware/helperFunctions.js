const TransactionModel = require("../models/Transaction");
const FLW_calls = require("./FLW_calls");
const uuid = require('uuid');
const randomWords = require('random-words');
const GamesModel = require('../models/Games')


  const prettyCurrency = amount => {
    const formatter = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2
    });
    const convertedAmount = formatter.format(amount);
    return convertedAmount;
  }

 const  makeTitleCase = str => {
    return str
      .toLowerCase()
      .split(" ")
      .map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

const  createUsername = name => {
        let randomId = uuid().split('-')[1].toLowerCase();
        let username = name.split(' ')[0].toLowerCase();
        return [username,randomId].join('-')
  }

const  verifyPayment = async (txref, transaction, txtype) => {
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
  }


const  getWords = () => {
  const words = randomWords({exactly:9, wordsPerString:2, separator:''})
  return words
}

const nextWord = async gameCode => {
  try{
    const game = await GamesModel.findOne({gameCode})
    if(!game){
      return {
        errors: [{ msg: "No game found" }]
      }
    }
    if(game.currentIndex === game.words.length - 1) return {endgame:true}
    const data = {
      status:"start",
      currentIndex: game.currentIndex + 1,
      currentWord: game.words[game.currentIndex + 1]
  }
    const updateGame = await GamesModel.updateOne({gameCode}, data)
    if(updateGame.n > 0) return data;
  }catch(err){
    return {
      errors: [{ msg: "Error occured" }]
    }
  }

}

const getScore =  async gameCode => {
      try{
        const game = await GamesModel.findOne({gameCode})
        if(!game){
          return {
            errors: [{ msg: "No game found" }]
          }
        }
        return game.players
      }catch(err){
        return {
          errors: [{ msg: "Error occured" }]
        }
      }
}

module.exports = {
  prettyCurrency,
  createUsername,
  verifyPayment, 
  makeTitleCase, 
  getWords,
  getScore,
  nextWord,
}