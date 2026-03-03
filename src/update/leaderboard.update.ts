import { AnyBulkWriteOperation } from "mongoose";
import { HLeaderboardDoc, LeaderboardModel, LeaderboardRepository } from "../DB";
import { getConnectionWithServer, serverConfigs } from "../utils";

class StartLeaderboardAutoUpdate {
  private leaderboardModel = new LeaderboardRepository(LeaderboardModel);
  private isUpdate: boolean = false;

  constructor() {
    if (process.env.NEXT_PHASE === "phase-production-build") return;
  }

  public async startAutoUpdate(
    interval = Number(process.env.LEADERBOARD_UPDATE_INTERVAL) || 60000,
  ) {
    const activeServerIds = Object.keys(serverConfigs);

    if (!activeServerIds.length) {
      console.warn("[AutoUpdate] ⚠️ No active servers found yet. Configuration might be loading. Retrying in 5s...");
      setTimeout(() => this.startAutoUpdate(interval), 5000);
      return;
    }

    if (this.isUpdate) return;
    this.isUpdate = true;

    console.log(`[AutoUpdate] 🚀 Starting loop for: ${activeServerIds.join(", ")}`);

    const update = async () => {
      try {
        await Promise.all(
          activeServerIds.map(async (serverName) => {
            try {
              const response = await getConnectionWithServer(serverName);
              if (!response || !response.sortedLeaderboard) return;

              const leaderboardData = response.sortedLeaderboard;
              if (leaderboardData.length === 0) return;

              const bulkData: AnyBulkWriteOperation<HLeaderboardDoc>[] =
                leaderboardData.map((user: any) => ({
                  updateOne: {
                    filter: { username: user.username, serverName: serverName },
                    update: {
                      $set: {
                        is_online: user.is_online,
                        username: user.username,
                        serverName: serverName,
                        avatar: user.avatar || `https://mc-heads.net/avatar/${user.username}/64`,
                        playTime: user.playTime,
                        rank: user.rank,
                        lastSeen: user.lastSeen,
                        joinTime: user.joinTime,
                        totalPlayTime: user.playTime,
                        updatedAt: new Date(),
                      },
                      $setOnInsert: { createdAt: new Date() },
                    },
                    upsert: true,
                  },
                }));

              await this.leaderboardModel.bulkWrite(bulkData as any);
              console.log(`[AutoUpdate] ✅ ${serverName} synced.`);
            } catch (serverError: any) {
              console.error(`[AutoUpdate] ❌ ${serverName} error:`, serverError.message);
            }
          }),
        );
      } finally {
        setTimeout(update, interval);
      }
    };

    update();
  }
}

export default new StartLeaderboardAutoUpdate();