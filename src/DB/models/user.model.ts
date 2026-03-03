import { model, models, Schema } from "mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { NotificationEnum, NotificationModel } from "./notification.model";
import { applyNotificationHook, OperationEnum } from "../../hooks/db.middleware";

export enum BlockEnum {
  block = "block",
  unblock = "unblock",
}

export enum GenderEnum {
  male = "male",
  female = "female",
}

export enum RoleEnum {
  super = "super",
  admin = "admin",
  user = "user",
}

export enum ProvidersEnum {
  system = "system",
  google = "google",
  discord = "discord",
}

export interface IUserSchema {
  username: string;
  password?: string;
  email?: string;
  resetpasswordOtp?: string;
  confirmEmailOtp?: string;
  gender: GenderEnum;
  role: RoleEnum;
  provider: ProvidersEnum;
  createdAt: Date;
  updatedAt?: Date;
  confirmedAt: Date;
  changedCredentialsAt: Date;
  expireAt: Date;
  expiredOtpAt: Date;
  forgetPasswordOtp: string;
  forgetPasswordOtpExpireAt: Date;
  confirmForgetPasswordAt: Date;
  blogId?: Types.ObjectId;
  googleId?: string;
  discordId?: string;
  avatar?: string;
  displayName?: string;

  isLogged: boolean;
  isBlocked: BlockEnum;
}

const schema = new Schema<IUserSchema>(
  {
    username: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: function (): any {
        return this.provider === ProvidersEnum.system;
      },
      unique: true,
    },
    password: {
      type: String,

      required: function (): any {
        return this.provider === ProvidersEnum.system;
      },
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(RoleEnum),
      default: RoleEnum.user,
    },
    gender: {
      type: String,
      required: function (): any {
        return this.provider === ProvidersEnum.system;
      },
      enum: Object.values(GenderEnum),
      default: GenderEnum.male,
    },
    blogId: {
      type: Types.ObjectId,
      ref: "Blog",
    },
    changedCredentialsAt: Date,
    confirmedAt: Date,
    createdAt: Date,
    updatedAt: Date,
    expireAt: Date,
    confirmEmailOtp: String,
    resetpasswordOtp: String,
    expiredOtpAt: Date,
    forgetPasswordOtp: String,
    forgetPasswordOtpExpireAt: Date,
    confirmForgetPasswordAt: Date,
    provider: {
      type: String,
      required: true,
      enum: Object.values(ProvidersEnum),
      default: ProvidersEnum.system,
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    discordId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: String,
    displayName: String,
    isLogged: { type: Boolean, default: false },
    isBlocked: { type: String, enum: BlockEnum, default: BlockEnum.unblock },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

applyNotificationHook({
  schema,
  model: NotificationModel,
  operation: OperationEnum.save,
  notificationType: NotificationEnum.NEW_USER,
  condition: (doc) => doc.isNew === true,
  getMessage: (doc) =>
    `Welcome! A new survivor joined the wasteland: ${doc.username}`,
});

applyNotificationHook({
  schema,
  model: NotificationModel,
  operation: OperationEnum.save,
  notificationType: NotificationEnum.BLOCK_USER,
  condition: (doc) => {
    if (doc.isNew || !doc.createdAt || !doc.updatedAt) return false;

    const isUpdate = doc.createdAt?.getTime?.() !== doc.updatedAt?.getTime?.();

    return isUpdate;
  },
  getMessage: (doc) => {
    const status =
      doc.isBlocked === BlockEnum.block ? "Terminated" : "Restored";
    return `Security Protocol: Access for ${doc.username} has been ${status}`;
  },
});
applyNotificationHook({
  schema,
  model: NotificationModel,
  operation: OperationEnum.findOneAndUpdate,
  notificationType: NotificationEnum.ADMIN_USER,
  getMessage: (doc) => {
    return `Security Protocol: Access for ${doc.username} has been ${doc.role}`;
  },
});

schema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
export const UserModel: Model<IUserSchema> =
  (models.User as any) || model<IUserSchema>("User", schema);
export type HUserDoc = HydratedDocument<IUserSchema>;
