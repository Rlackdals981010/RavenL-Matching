const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors"); // CORS 추가
const app = express();
const mongoose = require('mongoose'); // mongoose 추가

dotenv.config(); // 환경 변수 로드

app.use(cors()); // CORS 미들웨어 추가
app.use(bodyParser.json());


const { sequelize } = require('./config/database');

// 라우트 연결
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const searchRoutes = require('./routes/searchRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require("./routes/chatRoutes");
const uploadRoutes = require('./routes/upload');

app.use('/auth', authRoutes);
app.use('/mypage', userRoutes);
app.use('/', postRoutes);
app.use('/search', searchRoutes);
app.use('/payment', paymentRoutes);
app.use("/chat", chatRoutes);
app.use('/upload', uploadRoutes);

// 데이터베이스 연결
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    return sequelize.sync(); // DB 동기화
  })
  .catch(err => console.error('Unable to connect to the database:', err));


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// 서버 실행
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
