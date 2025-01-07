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
    const { email, password, name, phoneNumber, job } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    // 인증 코드 생성 및 전송
    const verificationCode = crypto.randomBytes(3).toString('hex');
    await sendVerificationEmail(email, verificationCode);

    // TempUser에 데이터 저장
    const hashedPassword = await bcrypt.hash(password, 10);
    await TempUser.create({
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      job,
    });

    // Verification에 인증 코드 저장
    await Verification.create({
      email,
      code: verificationCode,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15분 유효
    });

    res.status(200).json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // 인증 코드 확인
    const verification = await Verification.findOne({ where: { email, code } });
    if (!verification || verification.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    // TempUser에서 사용자 데이터 가져오기
    const tempUser = await TempUser.findOne({ where: { email } });
    if (!tempUser) {
      return res.status(400).json({ message: 'No pending registration for this email.' });
    }

    // 실제 사용자 테이블(User)에 데이터 저장
    const user = await User.create({
      email: tempUser.email,
      password: tempUser.password,
      name: tempUser.name,
      phoneNumber: tempUser.phoneNumber,
      role: 'user',
      job: tempUser.job,
      state: 'active',
    });

    // TempUser 및 Verification 데이터 삭제
    await tempUser.destroy();
    await verification.destroy();

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adminSignup = async (req, res) => {
  try {
    const { email, password, name, phoneNumber, job } = req.body;

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
      name,
      phoneNumber,
      role: 'admin',
      job,
      state: 'active'
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
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

    if(user.state==='deactive'){
      return res.status(401).json({ message: '탈퇴한 회원입니다.' });
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, job: user.job },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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
    const resetToken = crypto.randomBytes(3).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15분 유효

    // 기존 비밀번호 재설정 요청 삭제
    await Verification.destroy({ where: { email} });

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


// 비밀번호 재설정
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    // 토큰 검증
    const verification = await Verification.findOne({
      where: { email, code: token },
    });

    if (!verification || verification.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // 비밀번호 변경
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOne({ where: { email } });
    user.password = hashedPassword;
    await user.save();

    // 사용된 토큰 삭제
    await verification.destroy();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};