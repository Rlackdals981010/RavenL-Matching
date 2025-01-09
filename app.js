const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const app = express();
app.use(bodyParser.json());

dotenv.config(); // 환경 변수 로드

const { sequelize } = require('./config/database');

// 라우트 연결
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const searchRoutes = require('./routes/searchRoutes');
const testRoutes = require('./routes/testRoutes');
const chatRoutes = require('./routes/chatRoutes');


app.use('/auth', authRoutes);
app.use('/mypage', userRoutes);
app.use('/', postRoutes);
app.use('/search', searchRoutes);
app.use('/test',testRoutes);
app.use('/chats', chatRoutes);


// 데이터베이스 연결
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    return sequelize.sync(); // DB 동기화
  })
  .catch(err => console.error('Unable to connect to the database:', err));

// 서버 실행
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
