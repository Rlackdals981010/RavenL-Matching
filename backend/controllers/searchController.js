const OpenAI = require('openai');
const { Sequelize, Op } = require('sequelize');
const User = require('../models/user'); // User Sequelize 모델

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql',
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.queryDatabase = async (req, res) => {
    try {
        const { order } = req.body;
        const { job } = req.user; // 현재 사용자의 job (buyer/seller)

        if (!order || typeof order !== 'string' || order.trim().length === 0) {
            return res.status(400).json({ message: "Valid search order is required" });
        }

        // **1. 검색 대상 job 설정 (현재 사용자의 반대 job)**
        const jobType = job === 'buyer' ? 'seller' : 'buyer';

        // **2. DB에서 모든 product 가져오기**
        const allProducts = await User.findAll({
            attributes: ['product'], // product 필드만 가져오기
            where: { job: jobType }, // 반대 job만 필터링
        });

        const productList = allProducts
            .map((user) => user.product)
            .filter((product) => product) // null/undefined 제거
            .join(', '); // 콤마로 연결

        if (!productList) {
            return res.status(400).json({ message: "No products found for the specified job type." });
        }

        // **3. OpenAI에 product 데이터 전달**
        const gptResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: `
                    The following is a list of all products in the database for the job type '${jobType}': "${productList}".
                    Identify which products are most relevant to the following user query: "${order}".
                    Respond with a concise list of relevant products in lowercase, singular form, separated by commas.
                    `,
                },
            ],
        });

        const relevantProducts = gptResponse?.choices?.[0]?.message?.content;
        if (!relevantProducts) {
            throw new Error("Failed to retrieve relevant products from OpenAI");
        }

        // **4. OpenAI 결과 처리**
        const keywords = relevantProducts
            .split(',')
            .map((keyword) => keyword.trim().toLowerCase())
            .filter((keyword) => keyword.length > 0);

        if (keywords.length === 0) {
            return res.status(400).json({ message: "No relevant products found for the query." });
        }

        console.log("Relevant Products:", keywords);

        // **5. DB에서 관련 사용자 검색**
        const users = await User.findAll({
            attributes: ['job','email', 'name', 'company', 'position', 'region', 'product'], // 필요한 필드만 선택
            where: {
                job: jobType, // buyer/seller 필터링
                product: {
                    [Op.or]: keywords.map((keyword) => ({
                        [Op.like]: `%${keyword}%`,
                    })),
                },
            },
        });

        // **6. 결과 반환**
        res.status(200).json({
            message: "Query executed successfully",
            job: jobType,            
            result: users,
        });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};