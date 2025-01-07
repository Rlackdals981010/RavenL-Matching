const bcrypt = require('bcrypt');
const User = require('../models/user');
const Contact = require('../models/contact');
const jwt = require('jsonwebtoken');

// 컨택
exports.contact = async (req, res) => {
  try {
    const { targetId } = req.body;

    const applicant = await User.findByPk(req.user.id, {
      attributes: ['id'],
    });

    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // Receiver 조회
    const receiver = await User.findByPk(targetId, {
      attributes: ['id'],
    });

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const contact = await Contact.create({
      applicantId: applicant.id,
      receiverId: receiver.id,
      process: 'Submitted'
    })

    /**
     * 여기에 쪽지 발송 코드 삽입
     */

    res.status(201).json({ message: 'contacted successfully', contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 내가 신청한거 조회
exports.contactSent = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const contacts = await Contact.findAll({
      where: { applicantId: req.user.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json(contacts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 나에게 신청한거 조회
exports.contactReceive = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const contacts = await Contact.findAll({
      where: { receiverId: req.user.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json(contacts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 상태 변경하기
exports.changeState = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Contact 데이터를 조회합니다.
    const contact = await Contact.findOne({ where: { id } });

    // 2. 데이터가 없을 경우 처리
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if(contact.receiverId!==req.user.id){
      return res.status(404).json({ message: '권한이 없습니다.' });
    }

    // 3. 현재 상태를 확인하고 상태를 토글합니다.
    const newState = contact.process === 'Submitted' ? 'Accepted' : 'Submitted';

    // 4. 상태를 업데이트합니다.
    contact.process = newState;
    await contact.save();

    // 5. 성공 응답
    res.status(200).json({ message: 'State updated successfully', process: contact.process });
  } catch (error) {
    // 에러 처리
    res.status(500).json({ error: error.message });
  }
};

// 평점 남기기
exports.score = async (req, res) => {
  try {
    const { id } = req.params; // Contact의 ID
    const { rating } = req.body; // 평점과 대상 사용자 ID

    // 1. 평점 유효성 검사
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    // 2. Contact 조회
    const contact = await Contact.findOne({ where: { id } });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // 3. 로그인한 사용자가 Contact의 관련자인지 확인
    const loggedInUserId = req.user.id;
    const { applicantId, receiverId, buyerFlag, sellerFlag } = contact;

    if (loggedInUserId !== applicantId && loggedInUserId !== receiverId) {
      return res.status(403).json({ message: 'You are not authorized to rate this contact' });
    }

    // 4. 플래그 확인: 이미 평점을 남겼는지 체크
    if (loggedInUserId === applicantId && buyerFlag) {
      return res.status(400).json({ message: 'You have already rated this contact' });
    }

    if (loggedInUserId === receiverId && sellerFlag) {
      return res.status(400).json({ message: 'You have already rated this contact' });
    }

    // 5. Target ID는 반대사람
    const targetId = loggedInUserId === applicantId ? receiverId : applicantId;


    // 6. 대상 사용자(User) 조회
    const targetUser = await User.findOne({ where: { id: targetId } });
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

  

    // 새로운 평점 추가
    const currentRating = targetUser.rating || 0; // null인 경우 0으로 대체
    const currentTransactionCount = targetUser.transaction_count || 0; // null인 경우 0으로 대체
    
    const newTotalRating = currentRating * currentTransactionCount + rating;
    const newRatingCount = currentTransactionCount + 1;
    const newAverageRating = newTotalRating / newRatingCount;

    // User 테이블 업데이트
    targetUser.rating = newAverageRating;
    targetUser.transaction_count = newRatingCount;
    await targetUser.save();

    // 8. Contact 테이블의 플래그 업데이트
    if (loggedInUserId === applicantId) {
      contact.buyerFlag = true;
    } else if (loggedInUserId === receiverId) {
      contact.sellerFlag = true;
    }
    await contact.save();

    // 9. 성공 응답
    res.status(200).json({
      message: 'Rating updated successfully',
      user: {
        id: targetUser.id,        
        totalRating: targetUser.rating,
        ratingCount: targetUser.transaction_count,
      },
    });
  } catch (error) {
    // 10. 에러 처리
    res.status(500).json({ error: error.message });
  }
};