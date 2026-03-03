import { ServerService } from "./server.service";
import { Socket } from "socket.io";
export class ServerGateWay {
    private serverService:ServerService = new ServerService()
  constructor() {}

  register = async (socket: Socket) => {
    console.log("🔓 Monitoring Client Connected:", socket.id);

    await this.serverService.sendServerStats(socket);
  };
}
