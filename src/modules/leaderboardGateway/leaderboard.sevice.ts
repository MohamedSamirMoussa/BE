import { LeaderboardModel, LeaderboardRepository } from "../../DB";
import { clientServers, getIO, ILeaderboardSocket } from "../gateway";

export class LeaderboardService {
  private leaderboardModel = new LeaderboardRepository(LeaderboardModel);
  constructor() {}

  sendLeaderboard = async (socket: ILeaderboardSocket) => {
    const client = clientServers.get(socket.id);
    if (!client) return;

    const socketInstance = getIO().sockets.sockets.get(socket.id);
    if (!socketInstance || !socketInstance.connected) return;
    const { serverName, page, limit } = client;
    const skip = (page - 1) * limit;
    try {
      const [leaderboard, totalPlayers, onlineCount] = await Promise.all([
        this.leaderboardModel.find({
          filter: { serverName },
          sort: { "playTime.seconds": -1, is_online: -1 },
          options: {
            skip: skip,
            limit: limit,
            lean: true,
          },
        }),

        await this.leaderboardModel.countDocuments({ filter: { serverName } as any }),

        await this.leaderboardModel.countDocuments({
          filter: {
            serverName,
            is_online: true,
          },
        } as any),
      ]);


      socket.emit("leaderboard_updates", {
        serverName,
        leaderboard,
        pagination: {
          page,
          limit,
          totalPlayers: totalPlayers!,
          totalPages: Math.ceil(totalPlayers! / limit),
        },
        onlineCount,
        totalPlayers,
      });
    } catch (err) {
      console.error("Leaderboard send error:", err);
    }
  };
}
