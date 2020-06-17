const router = require('express').Router();
const protectedRoute = require("../middleware/auth");


// Models
const UserModel = require('../models/User')

router.get('/detail', protectedRoute, async(req, res)=>{
    try{
        const user = await UserModel.findOne({_id:req.userid})
        if(!user){
            return res.json({
                errors: [
                  {
                    msg: "User not found",
                  }
                ]
              });
        }
        return res.json({user, status:true})
    }
    catch(err){
      return res.json({
        errors: [
          {
            msg: "An error occurred, try again",
            err
          }
        ]
      });
    }
});


module.exports = router;