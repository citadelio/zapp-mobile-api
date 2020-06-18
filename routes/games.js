const router = require('express').Router();
const protectedRoute = require("../middleware/auth");
const isRequestFromMobile = require("../middleware/mobilecheck");

// MODELS
const GamesModel = require('../models/Games')
const UsersModel = require('../models/User')


router.post('/validate-code', isRequestFromMobile, async(req, res)=>{
    const {gameCode} = req.body
    try{
        const game = await GamesModel.findOne({gameCode});
        return res.json({
            status: game?false:true
        }) 
      }catch(err){
        return res.json({
            errors: [{ msg: "Error occured" }]
          });
      }
})

router.post('/game-data', isRequestFromMobile, async(req, res)=>{
      const {gameCode} = req.body
      try{
        const game = await GamesModel.findOne({gameCode});
        if(!game) {
          return res.json({
            errors: [{ msg: "Error occured" }]
          });
        }
        console.log(game)
        let newPlayersDetail = [];
        game.players.map(async player => {
            let  userDetail = await getPlayerDetails(player.playerId);
            console.log("GD",userDetail)
            newPlayersDetail.push(userDetail)
        })

        const gameData = {
          ...game,
          players:newPlayersDetail
        }
        // console.log(gameData)
        return res.json(gameData);
      }catch(err){
        return res.json({
          errors: [{ msg: "Error occured" }]
        });
      }
})

const getPlayerDetails = async playerId=>{
      try{
          const user = await UsersModel.findById(playerId);
          console.log("PD", user)
          return user;
      }catch(err){
        return res.json({
          errors: [{ msg: "Error occured" }]
        });
      }
}


module.exports = router;