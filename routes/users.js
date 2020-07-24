const router = require('express').Router();
const protectedRoute = require("../middleware/auth");
const isRequestFromMobile = require("../middleware/mobilecheck");


// Models
const UserModel = require('../models/User');
const BankAccountModel = require('../models/BankAccounts');

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

router.get('/get-active-users', isRequestFromMobile, async (req, res)=>{
  try{
    let randomLimit = Math.floor(Math.random() * 20) + 1;
    let randomOnline = Math.floor(Math.random() * 10) + 1;
      let users = await UserModel.find({role:"bot"}).skip(randomLimit).limit(randomOnline)
       users = users.map((a) => ({sort: Math.random(), value: a}))
                    .sort((a, b) => a.sort - b.sort)
                    .map((a) => a.value);
      return res.json(users);
  }catch(err){
    return res.json({
      errors: [{
          msg: "An error occurred, try again",
          err
        }]
    });
  }
} )

router.get('/get-updated-data/:userid', isRequestFromMobile, async(req, res)=>{
    try{
      const {userid} = req.params
        const user = await UserModel.findById(userid);
        return res.json(user);
    }catch(err){
      return res.json({
        errors: [
          {
            msg: "An error occurred, try again",
            err
          }
        ]
      });
    }
})
router.get('/get-bank-account/:userid', isRequestFromMobile, async(req, res)=>{
    try{
      const {userid} = req.params
        const account = await BankAccountModel.findOne({userid});
        if(!account) return res.json({status:false});
        return res.json({status:true});
    }catch(err){
      return res.json({
        errors: [
          {
            msg: "An error occurred, try again",
            err
          }
        ]
      });
    }
})


module.exports = router;