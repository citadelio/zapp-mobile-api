const router = require('express').Router();
const protectedRoute = require("../middleware/auth");
const isRequestFromMobile = require("../middleware/mobilecheck");
const allGames = require('../middleware/gameData');
const { getWords } = require('../middleware/helperFunctions')

// MODELS
const GamesModel = require('../models/Games')
const GamesRandomModel = require('../models/GamesRandom')
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
        // console.log(game);
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

router.get('/all-games', (req, res)=>{
    res.json(allGames);
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

router.post('/initRandomGame', isRequestFromMobile, async (req, res)=>{
    try{
        const {player, opponent} = req.body
        const words = getWords();
        let key = 0, mode;

        //get last game
        const allGames = await GamesRandomModel.find().sort({ created: -1 });
        if(allGames.length > 0){
          const lastGame = allGames[0];
          key = lastGame.key
        }
        //determine mode
       mode =  key%2 == 0 ? "easy": "hard";
        const newGame = new GamesRandomModel({
          key: key + 1, mode, player, opponent, words  
        })
        await newGame.save();
        res.json(newGame);
    }catch(err){
      return res.json({
        errors: [{ msg: "Error occured" }]
      });
    }
})


module.exports = router;