const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Room = require("../models/chatRoom");

// 현재 사용자가 속한 모든 채팅방 조회
router.get("/rooms", async (req, res) => {
    console.log("내가 불렸당")
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);

        // Room 스키마에서 참여 중인 방 목록 조회
        const rooms = await Room.find({ participants: user.id });
        res.json(rooms);
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

module.exports = router;