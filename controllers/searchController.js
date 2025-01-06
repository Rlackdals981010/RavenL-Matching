const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.logQuery = async (req, res) => {
    try {
        const { order } = req.body;

        if (!order) {
            return res.status(400).json({ message: "Search order is required" });
        }

        // OpenAI로 키워드 생성
        const gptResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: `Generate a concise list of food-related items or keywords associated with "${order}". Focus on specific food items, ingredients, or dishes. Return the results as a comma-separated list in English only.`,
                },
            ],
        });

        // OpenAI에서 생성된 키워드 처리
        const rawKeywords = gptResponse.choices[0].message.content;
        const keywords = rawKeywords
            .split(',')
            .map((keyword) => keyword.trim())
            .filter((keyword) => keyword.length > 0 && !keyword.includes(':') && !keyword.includes('-'));

        // SQL 쿼리 생성
        const sqlQuery = `SELECT * FROM buyers WHERE diet IN (${keywords.map((k) => `'${k}'`).join(", ")});`;

        // SQL 쿼리 출력
        console.log("Generated SQL Query:", sqlQuery);

        // 데이터베이스 실행 생략 (로그만 출력). -> 컴펌 후 매칭, 조회 형식 확정 후 구현 예정
        res.status(200).json({
            message: "SQL query generated successfully",
            order: sqlQuery,
            keywords,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};