import { Model, MongooseBaseQueryOptions } from "mongoose";
import { DBrepository } from "./db.repository";

import { INotificationSchema } from "../models/notification.model";

export class NotificationRepository extends DBrepository<INotificationSchema> {
  constructor(protected override readonly model: Model<INotificationSchema>) {
    super(model);
  }

  deleteMany({
    filter,
    options,
  }: {
    filter: any;
    options?: MongooseBaseQueryOptions<INotificationSchema> | null;
  }) {
    return this.model.deleteMany(filter, options);
  }
}
