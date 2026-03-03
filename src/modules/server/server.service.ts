import minecraftServer from "../../utils/minecraftServer/minecraftServer";

export class ServerService {
  constructor() {}
  async getFormattedStats() {
    try {
      const servers = await minecraftServer.getAllServers();
      const fullDetails = await Promise.all(
        servers.map(async (server: any) => {
          const identifier = server.attributes.identifier;
          const name = server.attributes.name;
          const connection = server.extracted_details
          const createdAt = server.attributes.created_at;
          try {
            const usage = await minecraftServer.getServerUsage(identifier);
            return {
              id: identifier,
              name: name,
              port: connection.port, // الـ Port الجديد
              node: server.attributes.node,
              createdAt: createdAt,
              usage: usage,

            };
          } catch (error) {

            
            return {
              id: identifier,
              name: name,
              status: "offline",
              port: "N/A",
              error,
            };
          }
        }),
      );
      return fullDetails;
    } catch (error) {
      console.error("Error fetching stats for socket:", error);
      return [];
    }
  }

  async sendServerStats(socket: any) {
    const stats = await this.getFormattedStats();
    socket.emit("server_stats_update", stats);
  }
}
