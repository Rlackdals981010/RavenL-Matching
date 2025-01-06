const Report = require('../models/report');
const User = require('../models/user');
// 신고 등록
exports.createReport = async (req, res) => {
    try {
        const { reason, targetId } = req.body;
        const reporterId = req.user.id;

        if (!reason || !targetId) {
            return res.status(400).json({ message: 'Reason and targetId are required' });
        }

        if (parseInt(targetId, 10) === reporterId) {
            return res.status(400).json({ message: "You can't report yourself" });
        }

        // targetId가 유효한 유저인지 확인
        const targetUser = await User.findByPk(targetId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        const report = await Report.create({ reason, targetId, reporterId });

        res.status(201).json({ message: 'Report created successfully', report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 신고 목록 조회 (관리자 전용)
exports.getReports = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can view reports' });
        }

        const reports = await Report.findAll();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 내가 등록한 신고 목록 조회
exports.getMineReports = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const userId = req.user.id;

        // 내가 등록한 신고 목록 조회
        const reports = await Report.findAll({
            where: { reporterId: userId },
            offset,
            limit: parseInt(limit, 10),
            order: [['createdAt', 'DESC']],
        });

        // 결과 반환
        res.status(200).json({
            message: 'My reports fetched successfully',
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            data: reports,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 내가 등록한 신고 단건 조회
exports.getMineReport = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id;

        // 신고 단건 조회
        const report = await Report.findOne({
            where: {
                id,
                reporterId: userId, 
            },
        });

        if (!report) {
            return res.status(404).json({ message: 'Report not found or not accessible.' });
        }

        // 결과 반환
        res.status(200).json({
            message: 'Report fetched successfully',
            data: report,
        });
    } catch (error) {
        // 에러 핸들링
        res.status(500).json({ error: error.message });
    }
};

// 신고 승인
exports.approveReport = async (req, res) => {
    try {
        const { id } = req.params;

        // 관리자 권한 확인
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can approve reports' });
        }

        const report = await Report.findByPk(id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // targetId가 유효한 유저인지 확인
        const targetUser = await User.findByPk(report.targetId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        report.status = 'approved';
        await report.save();

        res.status(200).json({ message: 'Report approved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 신고 거절
exports.rejectReport = async (req, res) => {
    try {
        const { id } = req.params;

        // 관리자 권한 확인
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can reject reports' });
        }

        const report = await Report.findByPk(id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // targetId가 유효한 유저인지 확인
        const targetUser = await User.findByPk(report.targetId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        report.status = 'rejected';
        await report.save();

        res.status(200).json({ message: 'Report rejected successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 신고 삭제 (관리자 전용)
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete reports' });
        }

        const deleted = await Report.destroy({ where: { id } });
        if (deleted) {
            return res.status(200).json({ message: 'Report deleted successfully' });
        }

        res.status(404).json({ message: 'Report not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};