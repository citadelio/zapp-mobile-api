const axios = require('axios');

const getAllBanks = async() => {
        try{
            const allBanks = await axios.get('https://api.paystack.co/bank', {
                headers:{
                    Authorization: `Bearer ${process.env.PSK_SECRET_KEY}`
                }
            })
            return allBanks.data
        }catch(err){
            console.log(err)
        }
}

const resolveAccountNumber = async(accountnumber, bankcode) => {
    try{
        let queryString = `?account_number=${accountnumber}&bank_code=${bankcode}`
        const name = await axios.get(`https://api.paystack.co/bank/resolve${queryString}`, {
            headers:{
                Authorization: `Bearer ${process.env.PSK_SECRET_KEY}`
            }
        })
        return name.data
    }catch(err){
        console.log(err)
    }
}

const initializeTransaction = async(transaction, user) => {

    try{
        let email = `${user.userid}@gmail.com`,
            callBack = `${process.env.BASE_PSK_URL}/wallets/payment-redirect`,
            amount = transaction.amount * 100; //amount in kobo

        const response = await axios.post(`https://api.paystack.co/transaction/initialize`,{
            amount, email,
            reference: transaction.txref,
            callback_url: callBack,
            channels:[transaction.method],
            metadata: JSON.stringify({custom_fields:[
                {name:user.name}
            ]})

        }, {
            headers:{
                Authorization: `Bearer ${process.env.PSK_SECRET_KEY}`,
                "Content-Type": "application/json"
            }
        })
        return response.data
    }catch(err){
        console.log(err)
    }
}

const verifyTransaction = async(txref) => {

    try{
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${txref}`, {
            headers:{
                Authorization: `Bearer ${process.env.PSK_SECRET_KEY}`
            }
        })
        return response.data
    }catch(err){
        console.log(err)
    }
}


module.exports = {
    getAllBanks,
    resolveAccountNumber,
    initializeTransaction,
    verifyTransaction
}