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

        // **1. 데이터베이스에서 product_name 및 category_2 가져오기**
        const allData = await FoodEvent.findAll({
            attributes: ['product_name', 'category_2'], // 필요한 필드만 가져오기
        });

        const dataArray = allData
            .map((row) => {
                const productName = row.product_name ? row.product_name.trim() : '';
                const category2 = row.category_2 ? row.category_2.trim() : '';
                return `${productName} ${category2}`.trim();
            })
            .filter((item) => item.length > 0);

        if (dataArray.length === 0) {
            return res.status(400).json({ message: "No valid data found in the database." });
        }

        // **2. 데이터 배치로 나누기 (동적 크기 조정)**: 배치 크기를 데이터 크기에 맞게 동적으로 조정
        const batchSize = Math.min(50, Math.ceil(dataArray.length / 5));
        const batches = [];
        for (let i = 0; i < dataArray.length; i += batchSize) {
            batches.push(dataArray.slice(i, i + batchSize));
        }

        console.log(`Data split into ${batches.length} batches of size ${batchSize}.`);

        // **3. OpenAI 호출 및 결과 통합 (최소 토큰 전략 적용)**
        const relevantEntriesSet = new Set();

        for (const [index, batch] of batches.entries()) {
            if (!batch || batch.length === 0) continue;

            try {
                const prompt = `
                    Here are the following products and categories: "${batch.join(', ')}".
                    Based on the user query "${order}", return the most relevant entries in a comma-separated list.
                    Limit your response to relevant product names or categories only.
                `.trim(); // 간결한 프롬프트 설계

                const gptResponse = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo", // 비용 절감을 위해 gpt-3.5-turbo 사용
                    messages: [{ role: "user", content: prompt }],
                });

                const responseContent = gptResponse?.choices?.[0]?.message?.content;

                if (!responseContent || responseContent.toLowerCase().includes("apologies")) {
                    console.log(`Batch ${index + 1}/${batches.length} failed: ${responseContent || "No valid response."}`);
                    continue;
                }

                responseContent
                    .split(',')
                    .map((entry) => entry.trim())
                    .filter((entry) => entry.length > 0)
                    .forEach((entry) => relevantEntriesSet.add(entry));

                console.log(`Batch ${index + 1}/${batches.length} processed successfully.`);
            } catch (error) {
                console.error(`Error processing batch ${index + 1}/${batches.length}:`, error.message);
            }
        }

        const relevantEntries = Array.from(relevantEntriesSet);

        if (relevantEntries.length === 0) {
            return res.status(400).json({ message: "No relevant entries found for the given query." });
        }

        console.log("All Relevant Entries:", relevantEntries);

        // **4. 관련 데이터베이스 행 검색**
        const results = await FoodEvent.findAll({
            where: {
                [Op.or]: [
                    { product_name: { [Op.in]: relevantEntries } },
                    { category_2: { [Op.in]: relevantEntries } },
                ],
            },
            attributes: ['id', 'product_name', 'category_2'], // 필요한 필드만 반환
        });

        if (results.length === 0) {
            return res.status(404).json({ message: "No matching rows found in the database." });
        }

        // **5. 결과 반환**
        res.status(200).json({
            message: "Query executed successfully",
            order,
            results,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};