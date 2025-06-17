// models/conversationModel.js
const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
