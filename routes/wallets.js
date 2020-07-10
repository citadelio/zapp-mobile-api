const router = require("express").Router();
const { getAllBanks } = require("../middleware/PaystackEndpoints");

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

router.get("/all-banks",async (req, res)=>{
    try{
        const banks = await BanksModel.find();
        res.json(banks[0].banks)
    }catch(err){
        console.log(err)
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
