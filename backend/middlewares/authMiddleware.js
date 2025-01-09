const jwt = require('jsonwebtoken');

// JWT 검증 미들웨어
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // request header에서 Authorization 값 읽기
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // JWT의 payload를 요청 객체에 추가
    next(); // 인증 성공 시 다음 미들웨어로 이동
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
