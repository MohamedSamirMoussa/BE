import { HydratedDocument } from "mongoose";
import { model, models, Schema } from "mongoose";
import {
  applyNotificationHook,
  OperationEnum,
} from "../../hooks/db.middleware";
import { NotificationEnum, NotificationModel } from "./notification.model";

export enum SupportedEnum {
  SUPPORTED = "Supporter",
  UN_SUPPORTED = "Un Supported",
}

export interface ILeaderboardUser {
  serverName: string;
  online_count?: number;
  username: string;
  is_online: boolean;
  playTime?: {
    seconds: number;
    minutes: number;
    hours: number;
  };
  lastSeen: Date;
  avatar: string;
  rank: {
    name: string;
  };
  isSupported?: {
    status: boolean;
    name?: string;
  };
  joinTime: Date;
}

const schema = new Schema<ILeaderboardUser>(
  {
    serverName: { type: String, required: true },
    online_count: Number,
    username: { type: String },
    is_online: { type: Boolean, required: true },
    playTime: {
      seconds: { type: Number },
      minutes: { type: Number },
      hours: { type: Number },
    },
    lastSeen: { type: Date, required: false, default: null },
    avatar: { type: String },
    rank: {
      name: { type: String, required: true },
    },
    isSupported: {
      status: Boolean,
      name: { type: String, enum: SupportedEnum, required: false },
    },
    joinTime: { type: Date, required: false, default: null },
  },
  {
    timestamps: true,
  },
);

applyNotificationHook({
  schema,
  model: NotificationModel,
  operation: OperationEnum.deleteMany,
  notificationType: NotificationEnum.DELETE_SERVER,
  getMessage: (res) =>
    `Action: Bulk removal executed. Total: ${res.deletedCount || "N/A"} nodes.`,
});
applyNotificationHook({
  schema,
  model: NotificationModel,
  operation: OperationEnum.findOneAndUpdate,
  notificationType: NotificationEnum.UPDATE_PLAYER,
  getMessage: (res: any) => {
    const wasSupporter = res?.isSupported?.status === true;
    const targetUser = res?.username || "a player";

    return wasSupporter
      ? `Action: You removed Supporter status from ${targetUser}`
      : `Action: You gave Supporter status to ${targetUser}`;
  },
});

schema.index({ "playTime.seconds": -1 });

export const LeaderboardModel =
  models.Leaderboard || model<ILeaderboardUser>("Leaderboard", schema);
export type HLeaderboardDoc = HydratedDocument<ILeaderboardUser>;
