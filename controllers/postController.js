const Post = require('../models/post');
const User = require('../models/user');

const MESSAGES = {
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    POST_NOT_FOUND: 'Post not found.',
    INQUIRY_NOT_FOUND: 'Inquiry not found.',
    NOTICE_NOT_FOUND: 'Notice not found.',
};


// 글 생성 (공지)
exports.createNotice = async (req, res) => {
    try {
        const { id: userId, role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({ message: MESSAGES.UNAUTHORIZED });
        }

        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const post = await Post.create({
            type: 'notice',
            title,
            content,
            userId,
        });

        res.status(201).json({ message: 'Notice created successfully', post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 글 목록 조회 (공지)
exports.getNotices = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const posts = await Post.findAll({
            where: { type: 'notice' },
            offset,
            limit: parseInt(limit, 10),
        });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 글 단건 조회 (공지)
exports.getNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findOne({ where: { id, type: 'notice' } });

        if (!post) {
            return res.status(404).json({ message: MESSAGES.NOTICE_NOT_FOUND });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 글 수정 (공통)
exports.patchPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // 게시글 조회
        const post = await Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // 작성자인 경우에만 수정 허용
        if (req.user.role==='admin') {
            // 요청 데이터로 게시글 업데이트
            await Post.update(
                { title, content },
                { where: { id } }
            );

            const updatedPost = await Post.findByPk(id);
            return res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
        }

        return res.status(403).json({ message: 'You are not authorized to update this post.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// 글 삭제
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ message: MESSAGES.POST_NOT_FOUND });
        }

        if (req.user.role === 'admin') {
            await Post.destroy({ where: { id } });
            return res.status(200).json({ message: 'Post deleted successfully' });
        }

        return res.status(403).json({ message: MESSAGES.UNAUTHORIZED });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};