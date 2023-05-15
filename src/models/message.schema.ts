import mongoose from 'mongoose';
import MessageDTO from '../dtos/message.dto';
import moment from "moment";

const messageSchema = new mongoose.Schema({
  added: {
    default: moment.utc().toISOString(),
    required: false,
    type: Date
  },
  senderId: {
    type: String,
    required: false,
  },
  senderName: {
    type: String,
    required: false,
  },
  senderEmail: {
    type: String,
    required: false,
  },
  senderImage: {
    type: String,
    required: false,
  },
  receiverName: {
    type: String,
  },
  receiverImage: {
    type: String,
  },
  receiverId: {
    type: String,
  },
  chat: {
  },
  accepted: {
    type: Date
  },
  updated: {
    default: moment.utc().toISOString(),
    required: false,
    type: Date
  },
  endchat: {
    default: moment.utc().toISOString(),
    required: false,
    type: Date
  },
  status: {
    type: String,
    default: 'New'
  },
  receiverjointime: {
    type: Date
  },
});

export const messageModel = mongoose.model<MessageDTO & mongoose.Document>(
  'message',
  messageSchema,
);
