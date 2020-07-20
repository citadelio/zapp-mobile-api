// const TransactionModel = require("../models/Transaction");
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

const calcProcessingFee = amount => {
  return amount * 0.05
}

module.exports = {
  prettyCurrency,
  createUsername,
  // verifyPayment, 
  makeTitleCase, 
  getWords,
  getScore,
  nextWord,
  calcProcessingFee
}