const bcrypt = require('bcrypt');
const User = require('../models/user');
const ResignComment = require('../models/resignComment'); 

// 내 정보 조회 
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'phoneNumber', 'job', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 내 정보 수정 
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, company, position,region,product,job } = req.body;

    // 수정할 데이터가 없는 경우
    if ( !name && !company &&!position&& !region&& !product &&!job) {
      return res.status(400).json({ message: 'At least one field is required to update profile' });
    }

    // 업데이트 데이터 구성
    const updates = {};
    if (name) updates.name = name;
    if (company) updates.company = company;
    if (position) updates.position = position;
    if (region) updates.region = region;
    if (product) updates.product = product;
    if (job) updates.job = job;

    // 사용자 데이터 업데이트
    const [updated] = await User.update(updates, { where: { id: req.user.id } });

    if (updated) {
      // 업데이트된 사용자 정보 반환
      const updatedUser = await User.findByPk(req.user.id, {
        attributes: ['id', 'email', 'name','company','position','region','product','job'],
      });
      return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    }

    res.status(400).json({ message: 'Failed to update profile' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 비밀번호 수정
exports.updateUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    // 사용자 조회
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 기존 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // 새 비밀번호 암호화 및 저장
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resign = async (req, res) => {
  try {
    const { email, password, comment } = req.body;

    // 사용자 조회 (비밀번호 포함)
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'password', 'name', 'phoneNumber', 'job', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 이메일 확인
    if (user.email !== email) {
      return res.status(400).json({ message: '이메일을 확인해 주세요.' });
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 탈퇴 이유 저장
    await ResignComment.create({
      email,
      comment,
    });

    // 사용자 상태 변경
    await user.update({ state: 'deactive' }); // 상태를 deactive로 변경

    res.status(200).json({ message: '회원 탈퇴가 완료되었습니다. 상태가 비활성화되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};