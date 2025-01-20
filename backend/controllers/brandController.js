const Brand = require('../models/brand'); // 브랜드 모델
const xlsx = require('xlsx'); // 엑셀 파일 파싱 라이브러리

// 1. 브랜드 단건 등록
exports.addBrand = async (req, res) => {
    try {
        const {
            productName,
            brandProduct,
            productUrl,
            category1,
            category2,
            category3,
            thumb,
            description,
            sellerAddress,
            babyFood,
            certification,
            madeIn,
        } = req.body;

        // 필수 데이터 검증
        if (!productName || !brandProduct) {
            return res.status(400).json({ message: 'Product name and Brand product are required.' });
        }

        // 브랜드 데이터 생성
        const brand = await Brand.create({
            productName,
            brandProduct,
            productUrl,
            category1,
            category2,
            category3,
            thumb,
            description,
            sellerAddress,
            babyFood: babyFood === 'true', // 문자열 "true"를 boolean으로 변환
            certification,
            madeIn,
        });

        res.status(201).json({ message: 'Brand added successfully.', brand });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. 엑셀 파일을 통한 브랜드 다중 등록
exports.addBrandsFromExcel = async (req, res) => {
    try {
        // 업로드된 파일 경로 가져오기
        const filePath = req.file.path;

        // 엑셀 파일 읽기
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // 첫 번째 시트를 사용
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // 데이터 삽입
        const brands = await Promise.all(
            sheetData.map(async (row) => {
                return await Brand.create({
                    productName: row['Product Name'] || null,
                    brandProduct: row['Brand product'] || null,
                    productUrl: row['Product URL'] || null,
                    category1: row['Category_1'] || null,
                    category2: row['Category_2'] || null,
                    category3: row['Category_3'] || null,
                    thumb: row['thumb'] || null,
                    description: row['desc'] || null,
                    sellerAddress: row['seller_addr'] || null,
                    babyFood: row['Baby food'] === 'Yes', // 엑셀 값 "Yes"를 boolean으로 변환
                    certification: row['Certification'] || null,
                    madeIn: row['Made in'] || null,
                });
            })
        );

        res.status(201).json({ message: 'Brands added successfully from Excel file.', brands });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};