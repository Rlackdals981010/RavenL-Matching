require('dotenv').config(); // dotenv 로드

module.exports = {
    PAYPAL_API: process.env.PAYPAL_API,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_SECRET: process.env.PAYPAL_SECRET
};