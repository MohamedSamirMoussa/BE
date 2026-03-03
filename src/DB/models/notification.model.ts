import { HydratedDocument, model, Schema, models, Types } from "mongoose";
import { getIO } from "../../modules";

export enum NotificationEnum {
  NEW_POST = "NEW_POST",
  POST_DELETED = "POST_DELETED",
  NEW_USER = "NEW_USER",
  BLOCK_USER = "BLOCK_USER",
  NEW_DONATION = "NEW_DONATION",
  SYSTEM = "SYSTEM",
  DELETE_SERVER = "DELETE_SERVER",
  UPDATE_PLAYER = "UPDATE_PLAYER",
  UPDATE_POST = "UPDATE_POST",
  PAGE_UPDATE = "PAGE_UPDATE",
  ADMIN_USER = "ADMIN_USER",
}

export interface INotificationSchema {
  type: NotificationEnum;
  message: string;
  metadata?: {
    userId?: Types.ObjectId;
    postId?: Types.ObjectId;
    donateId?: Types.ObjectId;
    username?: string;
    amount?: string;
    title?: string;
  };
}

const schema = new Schema<INotificationSchema>(
  {
    type: {
      type: String,
      enum: NotificationEnum,
      required: true,
    },

    message: { type: String, required: true },

    metadata: {
      userId: { type: Types.ObjectId, ref: "User" },
      postId: { type: Types.ObjectId, ref: "Blog" },
      donateId: { type: Types.ObjectId, ref: "Donation" },
      username: String,
      amount: String,
      title: String,
    },
  },
  { timestamps: true },
);

schema.post("save", function (doc) {
  try {
    const io = getIO();
    const payload = {
      _id: doc._id,
      type: doc.type,
      message: doc.message,
      metadata: doc.metadata,
    };

    io.of("/dashboard").emit("new_notification", payload);
    console.log(`🚀 Socket Emitted: ${doc.type}`);
  } catch (error) {
    console.error("❌ Socket Error:", error);
  }
});

export const NotificationModel =
  model<INotificationSchema>("Notification", schema) || models.Notification;

export type HNotificationDoc = HydratedDocument<INotificationSchema>;
