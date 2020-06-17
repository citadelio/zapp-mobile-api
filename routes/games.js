const router = require('express').Router();
const protectedRoute = require("../middleware/auth");
const isRequestFromMobile = require("../middleware/mobilecheck");

// MODELS
const GamesModel = require('../models/Games')


router.post('/validate-code', isRequestFromMobile, async(req, res)=>{
    const {gameCode} = req.body
    try{
        const game = await GamesModel.findOne({gameCode});
        console.log(game);
        return res.json({
            status: game?false:true
        }) 
      }catch(err){
        return res.json({
            errors: [{ msg: "Error occured" }]
          });
      }
})

module.exports = router;