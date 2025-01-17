const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomId: String,
    senderId: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }, // 메시지 읽음 여부
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);