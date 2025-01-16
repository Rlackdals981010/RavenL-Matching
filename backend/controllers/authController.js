const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const TempUser = require('../models/tempUser');
const Verification = require('../models/verification');


// 이메일 전송 함수
const sendVerificationEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // Gmail 계정
      pass: process.env.EMAIL_PASS, // 앱 비밀번호
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verification Code',
    text: `Your verification code is: ${code}`,
  });
};

// 회원가입
exports.signup = async (req, res) => {
  try {
    const { email } = req.body;

    // 필수 필드 검증
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // 이메일 형식 검증
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    // 기존 Verification 데이터 삭제
    const existingVerification = await Verification.findOne({ where: { email } });
    if (existingVerification) {
      await Verification.destroy({ where: { email } });
    }

    // 인증 코드 생성 (6자리 숫자)
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    await sendVerificationEmail(email, verificationCode);

    // Verification 데이터 저장
    await Verification.create({
      email,
      code: verificationCode,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15분 유효
    });

    res.status(200).json({ message: "Verification code sent to your email." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.verifyCode = async (req, res) => {
  try {
    const {  code } = req.body;

    // 인증 코드 확인
    const verification = await Verification.findOne({ where: { code } });
    if (!verification || verification.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    const email = verification.email;

    // Verification 데이터 삭제
    await Verification.destroy({ where: { email } });

    res.status(200).json({ message: "Verification successful." });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.completeSignup = async (req, res) => {
  try {
    const { email, password, name, company, position, region, product, job } = req.body;

    // 필수 필드 검증
    if (!password || !name || !job) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // 비밀번호 검증 (최소 길이 및 복잡성 체크)
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long and include at least one uppercase letter and one number." });
    }

    // 실제 사용자 테이블(User)에 데이터 저장
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      company,
      position,
      region,
      product,
      role: "user",
      job,
      state: "active",
    });

    res.status(201).json({ message: "User registered successfully", userId: user.id });
  } catch (error) {
    console.error("Complete signup error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.adminSignup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await User.create({
      email,
      password: hashedPassword,
      name: 'admin',
      company: 'admin',
      position: 'admin',
      region: 'admin',
      product: 'admin',
      role: 'admin',
      job: 'admin',
      state: 'active',
      rating: 0,
      rating_count: 0,
      transaction_count: 0
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const { email, password } = req.body;

    // 입력 데이터 검증
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 사용자 조회
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.state === 'deactive') {
      return res.status(401).json({ message: '탈퇴한 회원입니다.' });
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Uncorrect Password' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, email: user.email, name:user.name, role: user.role, job: user.job },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    
    // 응답
    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 비밀번호 재설정 요청
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // 사용자 확인
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 토큰 생성
    let resetToken;
    let tokenExists = true;

    // 고유한 토큰 생성
    while (tokenExists) {
      resetToken = crypto.randomBytes(3).toString('hex'); // 6자리 토큰 생성
      const existingToken = await Verification.findOne({ where: { code: resetToken } });
      if (!existingToken) {
        tokenExists = false; // 중복되지 않으면 루프 종료
      }
    }

    const expiresAt = Date.now() + 15 * 60 * 1000; // 15분 유효

    // 기존 비밀번호 재설정 요청 삭제
    await Verification.destroy({ where: { email } });

    // 새로운 비밀번호 재설정 요청 저장
    await Verification.create({
      email,
      code: resetToken,
      expiresAt,
    });

    // 이메일 전송
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Your password reset token is: ${resetToken}. It is valid for 15 minutes.`,
    });

    res.status(200).json({ message: 'Password reset token sent to email.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 토큰 확인
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.body;

    // 토큰 검증
    const verification = await Verification.findOne({
      where: { code: token },
    });

    if (!verification || verification.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    const email = verification.email;

    // 2. 사용자 정보 가져오기
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 3. JWT 생성
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET, // 비밀 키 환경 변수
      { expiresIn: '15m' } // 15분 유효
    );

    // 4. 사용된 토큰 삭제
    await verification.destroy();

    // 5. JWT 반환
    res.status(200).json({
      message: 'Token check complete. JWT issued.',
      token: jwtToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 비밀번호 재설정
exports.setPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    // JWT 미들웨어를 통해 이메일 추출
    const email = req.user.email;

    // 사용자 확인
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 비밀번호 변경
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();


    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};