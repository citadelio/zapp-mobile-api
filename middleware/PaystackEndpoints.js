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

        }
}


module.exports = {
    getAllBanks
}