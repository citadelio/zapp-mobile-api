const router = require("express").Router();
const { getAllBanks, resolveAccountNumber } = require("../middleware/PaystackEndpoints");
const isRequestFromMobile = require("../middleware/mobilecheck");

//Models
const BanksModel = require("../models/Banks");

router.get("/upate-all-banks", async (req, res) => {
  try {
    const allBanks = await getAllBanks();
    const savedBanks = await BanksModel.find();
    if (savedBanks.length < 1) {
      const newBanks = new BanksModel({
        banks: allBanks.data,
        updated: new Date(),
      });
      await newBanks.save();
      res.json(newBanks);
    } else {
      const updateBanks = await BanksModel.updateOne(
        { _id: savedBanks[0]._id },
        {
          banks: allBanks.data,
          updated: new Date(),
        }
      );
      res.json(updateBanks);
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/all-banks", isRequestFromMobile, async (req, res)=>{
    try{
        const banks = await BanksModel.find();
       return res.json(banks[0].banks)
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

router.post('/get-account-name', async (req, res)=>{
  try{
        const {accountnumber, bankcode} = req.body
        const name = await resolveAccountNumber(accountnumber, bankcode)
        console.log(name)
        return res.json(name)
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
