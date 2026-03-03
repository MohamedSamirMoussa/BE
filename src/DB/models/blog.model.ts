import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { NotificationEnum, NotificationModel } from "./notification.model";
import { applyNotificationHook, OperationEnum } from "../../hooks/db.middleware";

export interface IBlogSchema {
  title: string;
  description: string;
  image?: { secure_url: string; public_id: string };
  userId?: Types.ObjectId;
}

const schema = new Schema<IBlogSchema>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
      secure_url: String,
      public_id: String,
    },
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

applyNotificationHook({
  schema,
  model: NotificationModel,
  operation: OperationEnum.save,
  notificationType: NotificationEnum.NEW_POST,
  getMessage: (doc) => `New post created: ${doc.title}`,
})

applyNotificationHook({
  schema,
  model: NotificationModel,
  operation: OperationEnum.findOneAndDelete,
  notificationType: NotificationEnum.POST_DELETED,
  getMessage: (doc) => `Post deleted: ${doc.title}`,
})
applyNotificationHook({
  schema,
  model: NotificationModel,
  operation: OperationEnum.findOneAndDelete,
  notificationType: NotificationEnum.UPDATE_POST,
  getMessage: (doc) => `Post updated: ${doc.title}`,
})

export const BlogModel = models.Blog || model("Blog", schema);
export type HBlogDoc = HydratedDocument<IBlogSchema>;
