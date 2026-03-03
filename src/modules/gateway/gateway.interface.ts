import { Socket } from "socket.io";
import { HUserDoc } from "../../DB";
import { JwtPayload } from "jsonwebtoken";
import { NotificationEnum } from "../../DB/models/notification.model";

export interface ILeaderboardSocket extends Socket {
  credentials?: {
    user: Partial<HUserDoc>;
    decode: JwtPayload;
  };
  leaderboardData?: {
    userId: string;
    score: number;
  }[];
}

export interface INotificationSocket extends Socket {
  credentials?: {
    user: Partial<HUserDoc>;
    decode: JwtPayload;
  };
}

export interface INotificationPayload {
  type: NotificationEnum;
  message: string;
  data: {
    post?: { id: string; title: string; imageUrl: string };
    user?: { id: string; username: string; email: string };
    donation?: { amount: number; currency: string; username: string };
  };
  timestamp: Date;
}
