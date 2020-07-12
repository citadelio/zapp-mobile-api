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


module.exports = {
    getAllBanks,
    resolveAccountNumber
}