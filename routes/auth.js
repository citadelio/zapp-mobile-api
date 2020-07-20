const router = require('express').Router();
const jwt = require('jsonwebtoken');
const isRequestFromMobile = require("../middleware/mobilecheck");

// Models
const UserModel = require('../models/User')
/* MOBILE APP AUTH */
router.post('/mobile', isRequestFromMobile, async (req, res) => {
  try{
    const colorsArray = ['1da1f2','673AB7','009688','8BC34A','795548','FF9800','ad04bf']
    const randonumber = Math.floor(Math.random() * colorsArray.length)
    let randomColor = colorsArray[randonumber]
      const { id, name, picture, authType, email,userID} = req.body
      let userid, useremail, avatar;
       if(authType === "facebook"){
          userid = id; useremail = `${id}@gmail.com`;
          avatar = picture;
       }else if(authType === "twitter"){
          userid = userID; useremail = email;
          avatar = {
            data:{
              url: `https://ui-avatars.com/api/?name=${name}&background=${randomColor}&color=fff`
            }
          }
       }
        
          
      //check if id exist
      let user = await UserModel.findOne({userid});
      if(!user){
          //create a new user record
          user = new UserModel({
              name,
              authType,
              userid,
              avatar,
              email: useremail,
              role:"user",
          }) 
          console.log(user)
          await user.save();
      }
      //generate token using jwt
      const token = jwt.sign({userid: user.id}, process.env.jwtSecret, {
        expiresIn : 42000
      })
       return res
       .status(200)
       .json({ token, statuscode: "S1" });
  }catch(err){
      return res.status(401).json({
        errors: [{ msg: "invalid token" }]
      });
  }
})

router.post('/create-bot-user', isRequestFromMobile, async (req, res)=>{
        try{
          const { id, name, picture, bottype} = req.body
          let user = await UserModel.findOne({userid:id});
          if(!user){
              //create a new user record
              user = new UserModel({
                  name,
                  bottype,
                  authType:"bot",
                  avatar:{
                      data:{
                        url: picture
                      }
                  },
                  userid:id,
                  role:"bot"
              }) 
              await user.save();
              return res.json(user)
          }else{
            return res.json({msg:`User with id ${id} already exist`})
          }

        }catch(err){
          return res.status(401).json({
            errors: [{ msg: "Error" }]
          });
        }
})


module.exports = router;