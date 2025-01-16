const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomId: String,
    senderId: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);