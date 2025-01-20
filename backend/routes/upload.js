const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const Brand = require('../models/brand'); // Brand 모델 가져오기

const router = express.Router();

// Multer 설정
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// 엑셀 파일 업로드 및 처리
router.post('/brand', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;

        // 엑셀 파일 읽기
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        // 2번 행을 헤더로 설정
        const header = sheetData[1]; // 2번 행 (인덱스 1)
        const data = sheetData.slice(2); // 3번 행부터 데이터 시작

        // 헤더와 데이터를 매핑하여 JSON 형식으로 변환
        const brands = data.map(row => {
            const mappedRow = {};
            header.forEach((key, index) => {
                mappedRow[key.trim()] = row[index];
            });
            return {
                productName: mappedRow['Product Name'] || 'Unknown Product',
                brandProduct: mappedRow['Brand product'] || null,
                productUrl: mappedRow['Product URL'] || null,
                category1: mappedRow['Category_1'] || null,
                category2: mappedRow['Category_2'] || null,
                category3: mappedRow['Category_3'] || null,
                thumb: mappedRow['thumb'] || null,
                description: mappedRow['desc'] || null,
                sellerAddress: mappedRow['seller_addr'] || null,
                babyFood: mappedRow['Baby food'] === 'Yes',
                certification: mappedRow['certification'] || null,
                madeIn: mappedRow['Made in'] || null,
            };
        });

        console.log(brands); // 디버깅용 데이터 확인
        await Brand.bulkCreate(brands); // 데이터베이스에 삽입
        res.status(200).json({ message: 'Data uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing the file', error });
    }
});

module.exports = router;