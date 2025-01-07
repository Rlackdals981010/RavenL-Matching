const OpenAI = require('openai');
const User = require('../models/user');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.logQuery = async (req, res) => {
    try {
        const { order } = req.body;

        if (!order || typeof order !== "string" || order.trim().length === 0) {
            return res.status(400).json({ message: "Valid search order is required" });
        }

        // **1. OpenAI로 buyer/seller 구분**
        const jobResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: `The following is a request in multiple languages: "${order}". 
                    Identify whether the user is looking for a 'buyer' or a 'seller'. 
                    If it is unclear, return 'unknown'.`,
                },
            ],
        });

        const jobType = jobResponse?.choices?.[0]?.message?.content?.trim()?.toLowerCase();
        if (!jobType || (jobType !== 'buyer' && jobType !== 'seller')) {
            return res.status(400).json({ message: "Unable to determine whether the request is for a 'buyer' or a 'seller'." });
        }

        // **2. OpenAI로 키워드 생성**
        const gptResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: `Generate a concise list of food-related items or keywords associated with "${order}". 
                    Focus on specific food items, ingredients, or dishes. 
                    Return the results as a comma-separated list in English only.`,
                },
            ],
        });

        const rawKeywords = gptResponse?.choices?.[0]?.message?.content;
        if (!rawKeywords) {
            throw new Error("Failed to retrieve keywords from OpenAI");
        }

        // **3. 키워드 전처리**
        const keywords = rawKeywords
            .split(',')
            .map((keyword) => keyword.trim())
            .filter((keyword) => keyword.length > 0 && /^[a-zA-Z\s]+$/.test(keyword));

        if (keywords.length === 0) {
            return res.status(400).json({ message: "No valid keywords generated from input" });
        }

        // **4. DB 조회**
        const users = await User.findAll({
            where: {
                job: jobType, // buyer/seller 필터링
                product: keywords, // product 필드에서 키워드 검색
            },
        });

        // **5. 결과 반환**
        res.status(200).json({
            message: "Query executed successfully",
            job: jobType,
            keywords,
            result: users,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};