const router = require("express").Router();
const { getAllBanks, resolveAccountNumber } = require("../middleware/PaystackEndpoints");
const isRequestFromMobile = require("../middleware/mobilecheck");

//Models
const BanksModel = require("../models/Banks");
const BankAccountsModel = require("../models/BankAccounts");

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
      console.log("herere")
        const allbanks = await BanksModel.find();
       return res.json(allbanks[0].banks)
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

router.post('/get-account-name', isRequestFromMobile, async (req, res)=>{
  try{
        const {accountnumber, bankcode} = req.body
        const name = await resolveAccountNumber(accountnumber, bankcode)
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

router.post('/get-bank-name', isRequestFromMobile, async (req, res)=>{
  try{
        const {bankcode} = req.body
        let allBanks = await BanksModel.find();
        allBanks = allBanks[0].banks;
        allBanks.map(bank=>{
          if(bankcode == bank.code) return res.json(bank.name);
        })
        // return res.json(name)
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

router.post('/get-account-details', isRequestFromMobile, async (req, res)=>{
  try{
        const {userid} = req.body
        let account = await BankAccountsModel.find({userid}).sort("-created")
        account = account.length > 0 ? account[0]: null
       return res.json(account)
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
router.post('/save-account-details', isRequestFromMobile, async (req, res)=>{
  try{
        const {bankaccount, userid} = req.body
        let account = new BankAccountsModel({
          userid, bankaccount
        })
        await account.save()
        return res.json(account)
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
