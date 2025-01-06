const Mark = require('../models/mark');
const User = require('../models/user');

// 마크 추가
exports.addMark = async (req, res) => {
    try {
        const { targetId } = req.body;
        const userId = req.user.id;

        if (!targetId) {
            return res.status(400).json({ message: 'TargetId is required' });
        }

        // 대상 유저 확인
        const target = await User.findByPk(targetId);
        if (!target) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        const type = target.job;
        if (!['buyer', 'seller'].includes(type)) {
            return res.status(400).json({ message: 'Type must be either "buyer" or "seller"' });
        }

        // 마크 추가
        const mark = await Mark.create({ userId, targetId, type });
        res.status(201).json({ message: 'Mark added successfully', mark });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 마크 제거
exports.removeMark = async (req, res) => {
    try {
        const { targetId } = req.params;
        const userId = req.user.id;

        const removed = await Mark.destroy({ where: { userId, targetId } });
        if (removed) {
            return res.status(200).json({ message: 'Mark removed successfully' });
        }

        res.status(404).json({ message: 'Mark not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 즐겨찾기 타입별 조회
exports.getMarks = async (req, res) => {
    try {
      const { type } = req.params; // type을 params에서 가져옴
      const userId = req.user.id;
  
      if (!type || !['buyer', 'seller'].includes(type)) {
        return res.status(400).json({ message: 'Type must be either "buyer" or "seller"' });
      }
  
      const marks = await Mark.findAll({ where: { userId, type } });
      res.status(200).json(marks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };