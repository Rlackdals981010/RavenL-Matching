const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomId: { type: String, unique: true, required: true }, // 고유 방 ID
    participants: [{ type: String }], // 참여자 ID 목록
    createdAt: { type: Date, default: Date.now }, // 방 생성 시간
    isPrivate: { type: Boolean, default: false }, // 비공개 여부
});

module.exports = mongoose.model("Room", roomSchema);