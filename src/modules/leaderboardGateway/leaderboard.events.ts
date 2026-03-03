import { clientServers, ILeaderboardSocket } from "../gateway";
import { LeaderboardService } from "./leaderboard.sevice";

export class LeaderboardEvents {
  private leaderboardServices: LeaderboardService = new LeaderboardService();
  constructor() {}

  selectServerHandler = (socket: ILeaderboardSocket) => {
    console.log("🟢 Client connected:", socket.id);
    socket.on(
      "select_server",
      ({
        serverName,
        page,
        limit,
      }: {
        serverName: string;
        page?: number;
        limit?: number;
      }) => {
        clientServers.set(socket.id, {
          serverName: serverName?.toLowerCase().trim() || "",
          page: page!,
          limit: limit!,
        });

        this.leaderboardServices.sendLeaderboard(socket);
      },
    );
  };
}
