import { NotificationEvents } from "./notification.events";
import { INotificationSocket } from "../gateway";
import { NotificationEnum } from "../../DB/models/notification.model";

export class NotificationGateway {
  private notificationEvents: NotificationEvents = new NotificationEvents();

  constructor() {}

  register = (socket: INotificationSocket) => {
    console.log("🔓 Admin Connected to Namespace:", socket.id);

    this.notificationEvents.registerAdminListeners(socket);
    this.notificationEvents.emitToAll(socket, {
      type: NotificationEnum.SYSTEM,
      message: "Connected to Admin Live Feed",
      timestamp: new Date(),
    });
  };
}
