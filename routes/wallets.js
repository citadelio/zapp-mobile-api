const router = require("express").Router();
const { getAllBanks, resolveAccountNumber, initializeTransaction , verifyTransaction} = require("../middleware/PaystackEndpoints");
const isRequestFromMobile = require("../middleware/mobilecheck");
const uuid = require('uuid')
//Models
const UsersModel = require("../models/User");
const BanksModel = require("../models/Banks");
const BankAccountsModel = require("../models/BankAccounts");
const TransactionsModel = require("../models/Transactions");
const PaymentsModel = require("../models/Payments");
const { calcProcessingFee } = require("../middleware/helperFunctions");


router.get('/payment-redirect',async (req, res)=>{
  const {trxref} = req.query;
  //get transaction
  const response = await TransactionsModel.findOne({txref:trxref});
  if(response.status == "pending"){
  const transaction = await verifyTransaction(trxref);
    if(transaction.status){
      //save to payment
      const {data} = transaction;
      const newPayment = new PaymentsModel({
        userid: response.userid,
        status:data.status,
        txref: data.reference,
        amount: data.amount,
        paidat: data.paid_at,
        channel: data.channel,
        ip: data.ip_address,
        customername: data.metadata.custom_fields[0].name,
        transactioncharge: data.fees,
        authorization:data.authorization,
        customer:data.customer,
      })
      await newPayment.save();
      //update transaction status to success
      const updateTranx = await TransactionsModel.updateOne({txref:trxref},{status:data.status})
      if(data.status == "success"){
        //update user's wallet balance
        const user = await UsersModel.findById(response.userid)
        if(user){
          const updateUser = await UsersModel.updateOne({_id:response.userid},{
            wallet: user.wallet + (data.amount/100)
          })
          if(updateUser.n > 0){
            res.redirect(`${process.env.BASE_PSK_URL}`)
          }
        }
      }else{
        //redirect to failed transaction.
      }
}
  }
})

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
  console.log("in All Banks")
    try{
        const allbanks = await BanksModel.find();
        console.log("got to All Banks")
        console.log(allbanks[0].banks[5].name)
      return res.json(allbanks[0].banks);
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
  console.log("in Get Account Details")
  try{
        const {userid} = req.body
        let account = await BankAccountsModel.find({userid}).sort("-created")
        console.log("1",account)
        account = account.length > 0 ? account[0]: null
        console.log("2",account)
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
          userid,
          accountname:bankaccount.accountname,
          bankcode:bankaccount.bankcode,
          accountnumber:bankaccount.accountnumber,
          bankname:bankaccount.bankname,
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

router.post('/fund', isRequestFromMobile, async(req, res)=>{
      try{
            const {amount, method, user} = req.body;
            const txref = uuid();
            //save to DB
            const newTransaction = new TransactionsModel({
              method,
              amount,
              txref,
              userid: user._id,
              status:"pending",
              type:"fund",
            })
            if(await newTransaction.save()){
              //initialize transaction on paystack
              const response = await initializeTransaction(newTransaction, user)
              console.log(response);
              res.json(response);
            }
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

router.post("/get-all-transactions", isRequestFromMobile, async(req, res)=>{
  try{
    const {userid} = req.body
      const allTransactions = await TransactionsModel.find({userid}).sort("-created");
      return res.json(allTransactions);
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

router.post("/withdraw-funds", isRequestFromMobile, async (req,res)=>{
    try{
        const{userid, amount} = req.body;
        //check is user has sufficient funds
        const charge = calcProcessingFee(parseFloat(amount))
        const user = await UsersModel.findById(userid);
       
        if(Number(parseFloat(amount) + parseFloat(charge)) > Number(parseFloat(user.wallet)) ){
          return res.json({
            errors: [
              {
                msg: "You do not have sufficient funds in your wallet balance",
              }
            ]
          });
        }
        // deduct user balance
        const updateUser = await UsersModel.updateOne({_id:userid}, {wallet:Number(user.wallet) - Number(amount + charge)})
        if(updateUser.n > 0){
          const txref = uuid();
          //insert transaction data
          const newTransaction = new TransactionsModel({
            userid,
            amount,
            txref,
            status:"pending",
            type:"withdrawal",
          })
          await newTransaction.save();
          //get user
          const userData = await UsersModel.findById(userid);
          return res.json(userData);
        }

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

router.post('/deduct-game-fee', isRequestFromMobile, async (req, res)=>{
  try{
    const {user, stake} = req.body;
    const getUser = await UsersModel.findById(user._id);
    if(!getUser){
      return res.json({
        errors: [
          {
            msg: "User not found",
          }
        ]
      });
    }

    if(parseFloat(stake) > parseFloat(getUser.wallet)){
      return res.json({
        errors: [
          {
            msg: "You do not have sufficient funds in your wallet",
          }
        ]
      });
    }
    const updateUser = await UsersModel.updateOne({_id:getUser._id}, {wallet:parseFloat(getUser.wallet) - parseFloat(stake)})

    if(updateUser.n > 0){
      return res.json({status:"success"})
    }

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

router.post('/update-user-balance', isRequestFromMobile, async(req, res)=>{
  try{
      const {amount,userid, isWinner} = req.body;
      const user = await UsersModel.findById(userid);
      if(isWinner){
      const updateUser = await UsersModel.updateOne({_id:userid},{wallet:(parseFloat(user.wallet) + parseFloat(amount))})
      }
      const recentUser = await UsersModel.findById(userid);
      res.json(recentUser);
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
