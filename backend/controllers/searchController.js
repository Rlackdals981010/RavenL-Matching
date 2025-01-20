const OpenAI = require('openai');
const { Sequelize, Op } = require('sequelize');
const Brand = require('../models/brand'); // Brand Sequelize 모델
const User = require('../models/user');  // User Sequelize 모델

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql',
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// **Brand 검색 함수**
async function searchInBrand(order) {
    // Brand 테이블에서 Category_3 가져오기
    const allCategories = await Brand.findAll({
        attributes: ['category3'], // Category_3 데이터만 가져오기
    });

    // 중복 없는 Category_3 리스트 생성
    const uniqueCategories = Array.from(
        new Set(
            allCategories
                .map((brand) => brand.category3) // category3 필드만 추출
                .filter((category) => category) // null/undefined 제거
        )
    );

    if (uniqueCategories.length === 0) {
        throw new Error("No categories found in the brand table.");
    }

    // 카테고리를 콤마로 연결하여 OpenAI에 전달
    const categoryList = uniqueCategories.join(', ');

    // OpenAI에 카테고리 데이터 전달
    const gptResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: `
                Here is a list of unique categories from the brand table: "${categoryList}".
                Based on the query: "${order}", identify the most relevant categories.
                Respond with a list of relevant categories in lowercase, singular form, separated by commas.
                `,
            },
        ],
    });

    const relevantCategories = gptResponse?.choices?.[0]?.message?.content;
    if (!relevantCategories) {
        throw new Error("Failed to retrieve relevant categories from OpenAI");
    }

    const keywords = relevantCategories
        .split(',')
        .map((keyword) => keyword.trim().toLowerCase())
        .filter((keyword) => keyword.length > 0);

    if (keywords.length === 0) {
        throw new Error("No relevant categories found for the query.");
    }

    console.log("Relevant Categories:", keywords);

    // DB에서 관련 카테고리에 속한 브랜드 검색
    const brands = await Brand.findAll({
        attributes: ['productName', 'brandProduct', 'productUrl', 'category1', 'category2', 'category3', 'description'],
        where: {
            category3: {
                [Op.or]: keywords.map((keyword) => ({
                    [Op.like]: `%${keyword}%`, // 키워드가 포함된 Category_3 검색
                })),
            },
        },
    });

    return brands;
}

// **User 검색 함수**
async function searchInUser(order, jobType) {
    // User 테이블에서 모든 product 가져오기
    const allProducts = await User.findAll({
        attributes: ['product'],
        where: { job: jobType },
    });

    const productList = allProducts
        .map((user) => user.product)
        .filter((product) => product) // null/undefined 제거
        .join(', '); // 콤마로 연결

    if (!productList) {
        throw new Error("No products found for the specified job type.");
    }

    // OpenAI에 product 데이터 전달
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

    const keywords = relevantProducts
        .split(',')
        .map((keyword) => keyword.trim().toLowerCase())
        .filter((keyword) => keyword.length > 0);

    if (keywords.length === 0) {
        throw new Error("No relevant products found for the query.");
    }

    console.log("Relevant Products for Seller:", keywords);

    // DB에서 관련 사용자 검색
    const users = await User.findAll({
        attributes: ['job', 'email', 'name', 'company', 'position', 'region', 'product'],
        where: {
            job: jobType,
            product: {
                [Op.or]: keywords.map((keyword) => ({
                    [Op.like]: `%${keyword}%`,
                })),
            },
        },
    });

    return users;
}

// **Main Controller**
exports.queryDatabase = async (req, res) => {
    try {
        const { order } = req.body;
        const { job } = req.user; // 현재 사용자의 job (buyer/seller)

        if (!order || typeof order !== 'string' || order.trim().length === 0) {
            return res.status(400).json({ message: "Valid search order is required" });
        }

        let result;
        if (job === 'buyer') {
            // Buyer의 경우 Brand 검색
            result = await searchInBrand(order);
        } else {
            // Seller의 경우 User 검색
            const jobType = job === 'buyer' ? 'seller' : 'buyer';
            result = await searchInUser(order, jobType);
        }

        res.status(200).json({
            message: "Query executed successfully.",
            result,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};