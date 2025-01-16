const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Message = require("../models/chatMessage");

// 현재 사용자가 속한 모든 채팅방 조회
router.get("/rooms", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    // 현재 사용자가 속한 방(roomId)을 MongoDB에서 조회
    const rooms = await Message.find({
      $or: [{ roomId: { $regex: `^${user.id}-` } }, { roomId: { $regex: `-${user.id}$` } }],
    })
      .distinct("roomId"); // roomId의 중복 제거

    res.json(rooms); // 방 목록 반환
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;