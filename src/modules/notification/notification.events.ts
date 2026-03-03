import { INotificationSocket } from "../gateway";

export class NotificationEvents {
  constructor() {}

  registerAdminListeners = (socket: INotificationSocket) => {
    socket.on("admin_ping", (data) => console.log("📩 From Admin:", data));
    
  };

  emitToAll = (socketOrIo: any, data: any) => {    
    socketOrIo.emit("new_notification", data);
  };
}
