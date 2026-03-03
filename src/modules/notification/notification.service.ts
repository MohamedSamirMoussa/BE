import { NextFunction, Request, Response } from "express";
import { NotificationRepository } from "../../DB/DBrepository/notification.repository";
import { NotificationModel } from "../../DB/models/notification.model";
import { successHandler } from "../../utils";

class NotificationService {
  private notificationModel = new NotificationRepository(NotificationModel);
  constructor() {}

  getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const notifications = await this.notificationModel.find({
        filter: {},
        options: { lean: true, sort: { createdAt: -1 } },
      });

      return successHandler({ res, result: notifications });
    } catch (error) {
      return next(error);
    }
  };

  clearNotification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.notificationModel.deleteMany({
        filter: {},
      });

      return successHandler({res , message:"Notification cleared"})
    } catch (error) {
      return next(error);
    }
  };
}

export default new NotificationService();
