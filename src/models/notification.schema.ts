import mongoose from 'mongoose';
import NotificationDTO from '../dtos/notification.dto';
import moment from "moment";

const notificationSchema = new mongoose.Schema({
  added: {
    at: {
      default: moment.utc().toISOString(),
      required: false,
      type: Date,
    }
  },
  status: {
      type: String,
      required: true,
      default: 'Pending'
  },
  name: {
    type: String,
    required: false,
    default: ''
  },
  type: {
    type: String,
    required: true,
    default: ''
  },
  email: {
      type: String,
      required: false,
      default: ''
  },
  message: {
    type: String,
    required: true,
    default: ''
},
  itemId: {
      type: String,
      default: ''
  },
  item: {
      type: String,
      default: ''
  },
  userId: {
    type: String,
    required: true,
    default: ''
}
});
export const notificationModel = mongoose.model<NotificationDTO & mongoose.Document>(
    'notifications',
    notificationSchema,
  );
