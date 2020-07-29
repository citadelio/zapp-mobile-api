const router = require('express').Router();
const protectedRoute = require("../middleware/auth");
const isRequestFromMobile = require("../middleware/mobilecheck");
const allGames = require('../middleware/gameData');
const { getWords } = require('../middleware/helperFunctions')

// MODELS
const GamesModel = require('../models/Games')
const GamesRandomModel = require('../models/GamesRandom')
const UsersModel = require('../models/User')
const LeaderboardModel = require('../models/Leaderboard')
const HistoryModel = require('../models/History')
const GamePinModel = require('../models/GamePins')


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

router.post('/init-randomGame', isRequestFromMobile, async (req, res)=>{
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

router.post('/random-game-update', isRequestFromMobile, async(req, res)=>{
      try{
          const {thisPlayer, opponent, gameInfo} = req.body
          const game = await GamesRandomModel.findById(gameInfo._id);
          if(game){
            const updateGame = await GamesRandomModel.updateOne({_id:game._id},{
              player : {
                ...game.player, point: thisPlayer.point
              },
              opponent : {
                ...game.opponent, point: opponent.point
              }
            })
              console.log(updateGame);
            if(updateGame.n > 0){
              res.json({status:true})
            }else{
              res.json({
                errors: [{ msg: "Unable to save" }]
              })
            }
          }
      }catch(err){
          res.json({
            errors: [{ msg: "Error occured" }]
          })
      }
})

router.get("/get-leaderboard", isRequestFromMobile, async (req, res)=>{
  try{
    let td = new Date(new Date().setDate(new Date().getDate())),
    today = td.setHours(0, 0, 0, 0);
      const leaders = await LeaderboardModel.find({created:today}).sort("-wins").limit(50)
      return res.json(leaders)
  }catch(err){
    res.json({
      errors: [{ msg: "Error occured" }]
    })
  }
})

router.post("/update-leaderboard", isRequestFromMobile, async(req, res)=>{
  try{
    const {userid, name, avatar} = req.body;
  let td = new Date(new Date().setDate(new Date().getDate())),
      today = td.setHours(0, 0, 0, 0);
    const userBoard = await LeaderboardModel.findOne({userid, created:today});
    if(userBoard){
      const updateUser = await LeaderboardModel.updateOne({userid}, {avatar, wins:userBoard.wins + 1})
      if(updateUser.n > 0) return res.json(updateUser)

    }else{
      const newUser = new LeaderboardModel({
        userid, name, avatar, wins: 1, created:today
      })
      await newUser.save()
      return res.json(newUser);
    }

  }catch(err){
    res.json({
      errors: [{ msg: "An error occured" }]
    })
  }
})
router.get('/my-history/:userid', isRequestFromMobile, async (req, res)=>{
  try{
      const {userid } = req.params
      const history = await HistoryModel.find({userid}).sort("-created").limit(50)
      return res.json(history);
  }catch(err){
    res.json({
      errors: [{ msg: "An error occured" }]
    })
  }
})

router.post('/update-history', isRequestFromMobile, async (req, res)=>{
  try{
        const { userid,iswinner,userpoint,opponentpoint,opponentname} = req.body
        const newHistory = new HistoryModel({
          userid,iswinner,userpoint,opponentpoint,opponentname
        })
        await newHistory.save();
        return res.json(newHistory);
  }catch(err){
    res.json({
      errors: [{ msg: "An error occured" }]
    })
  }
})

router.post("/save-multigame-pin", isRequestFromMobile, async(req, res)=>{
  try{
      const {gameCode, name, creator} = req.body;
      const game = await GamePinModel.findOne({gameCode});
      if(!game){
          const newGamePin = new GamePinModel({
            name,
            gameCode,
            creator,
          })
          await newGamePin.save();
          res.json(newGamePin)
      }else{
        res.json({
          errors: [{ msg: "Error creating game, Close and try again" }]
        })
      }

  }catch(err){
    res.json({
      errors: [{ msg: "An error occured" }]
    })
  }
})
router.get("/get-multigame-pin/:gameCode", isRequestFromMobile, async(req, res)=>{
  try{
    const {gameCode} = req.params;
      const game = await GamePinModel.findOne({gameCode});
      if(!game){
        return  res.json({
          errors: [{ msg: "Invalid Game Code " }]
        })
      }
      return res.json(game)
  
  }catch(err){
    res.json({
      errors: [{ msg: "An error occured" }]
    })
  }
})

router.get("/check-multiplayer-game/:gameCode", isRequestFromMobile, async(req, res)=>{
  try{
    console.log(1)
    const {gameCode} = req.params;
    console.log(gameCode)
      const game = await GamesModel.findOne({gameCode});
      console.log(game)
      if(game){
        return res.json({status:true, game})
      }else{
        return res.json({status:false})
      }
  
  }catch(err){
    res.json({
      errors: [{ msg: "An error occured" }]
    })
  }
})

router.get("/version", (req, res)=>{
    res.json({
      version: 1.1,
      link: "https://play.google.com/store/apps/details?id=com.twitter.android&hl=en"
    })
})
module.exports = router;