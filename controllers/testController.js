const OpenAI = require('openai');
const FoodEvent = require('../models/foodEvent'); // Sequelize 모델
const { Op } = require('sequelize');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.testController = async (req, res) => {
    try {
        const { order } = req.body;

        if (!order || typeof order !== 'string' || order.trim().length === 0) {
            return res.status(400).json({ message: "Valid search order is required" });
        }

        // **1. 데이터베이스에서 카테고리 가져오기**
        const allCategories = await FoodEvent.findAll({
            attributes: ['Category_1', 'Category_2'], // Category_1 및 Category_2 필드만 가져오기
        });

        // **2. 중복 제거**
        const uniqueCategories = new Set();
        allCategories.forEach((row) => {
            if (row.Category_1) uniqueCategories.add(row.Category_1.toLowerCase().trim());
            if (row.Category_2) uniqueCategories.add(row.Category_2.toLowerCase().trim());
        });

        const categoriesArray = Array.from(uniqueCategories);

        if (categoriesArray.length === 0) {
            return res.status(400).json({ message: "No categories found in the database." });
        }

        // **3. OpenAI로 사용자 질의와 가장 관련성 높은 카테고리 찾기**
        const gptResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: `
                    The following are categories available in the database: "${categoriesArray.join(', ')}".
                    Based on the user query "${order}", identify the most relevant categories.
                    Return the relevant categories as a comma-separated list.
                    `,
                },
            ],
        });

        const relevantCategories = gptResponse?.choices?.[0]?.message?.content
            .split(',')
            .map((category) => category.trim().toLowerCase()) // 소문자로 변환하여 비교
            .filter((category) => category.length > 0);

        if (!relevantCategories || relevantCategories.length === 0) {
            return res.status(400).json({ message: "No relevant categories found for the given query." });
        }

        console.log("Relevant Categories:", relevantCategories);

        // **4. 관련 데이터베이스 행 검색**
        const results = await FoodEvent.findAll({
            where: {
                [Op.or]: [
                    { Category_1: { [Op.in]: relevantCategories } },
                    { Category_2: { [Op.in]: relevantCategories } },
                ],
            },
            attributes: ['id', 'product_name', 'brand_product', 'description', 'Category_1', 'Category_2'], // 필요한 필드만 선택
        });

        if (results.length === 0) {
            return res.status(404).json({ message: "No matching rows found in the database." });
        }

        // **5. 결과 반환**
        res.status(200).json({
            message: "Query executed successfully",
            order,
            relevantCategories,
            results,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};