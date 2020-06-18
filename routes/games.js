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
    try{
    let playersArray = [];
    const {gameCode} = req.body
        const game = await GamesModel.findOne({gameCode});
        if(!game) {
          return res.json({
            errors: [{ msg: "No game found" }]
          });
        }
        console.log(game);
      game.players.map(
          async (player,key) => {
          let  userDetail = await getPlayerDetails(player.playerId);
          playersArray.push(userDetail);
            if(key === 1){
                game.players = playersArray
              return res.json(game);
            }
        }
        )
      }catch(err){
        return res.json({
          errors: [{ msg: "Error occured" }]
        });
      }
})

const getPlayerDetails = async playerId=>{
      try{
          const user = await UsersModel.findById(playerId);
          return user;
      }catch(err){
        return res.json({
          errors: [{ msg: "Error occured" }]
        });
      }
}


module.exports = router;