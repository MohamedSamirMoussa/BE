import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { LeaderboardGateway } from "../leaderboardGateway/leaderboard.gateway";
import { ILeaderboardSocket, INotificationSocket } from "./gateway.interface";
import { LeaderboardService } from "../leaderboardGateway/leaderboard.sevice";
import { BadRequestError } from "../../utils";
import { NotificationGateway } from "../notification";
import { ServerGateWay } from "./../server/server.gateway";
import { ServerService } from "../server";

type ClientData = {
  serverName?: string;
  page: number;
  limit: number;
};

export const clientServers = new Map<string, ClientData>();

let io: Server | undefined;

export const initIO = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FE_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
    connectTimeout: 45000,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  /*-------------------- Events Handler -------------------- */
  const leaderboardGateway = new LeaderboardGateway();
  const notificationGateway = new NotificationGateway();
  const serverGateWay = new ServerGateWay();
  const leaderboardService = new LeaderboardService();
  const serverService = new ServerService();
  const disconnectHandler = (
    socket: ILeaderboardSocket | INotificationSocket,
  ) => {
    return socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
      clientServers.delete(socket.id);
    });
  };
  // Leaderboard
  io.on("connection", (socket) => {
    leaderboardGateway.register(socket);

    disconnectHandler(socket);
  });

  // Notification
  // localhost:3000/dashboard

  io.of("/dashboard").on("connection", (socket) => {
    notificationGateway.register(socket);
    serverGateWay.register(socket);
    disconnectHandler(socket);
  });
  /* -------------------- Global Interval -------------------- */
  let lastStatsCache: any = null;
  let isFetching = false;


  setInterval(() => {
    const serverNamespace = io?.of("/dashboard");
    if (serverNamespace && serverNamespace.sockets.size > 0 && lastStatsCache) {
      serverNamespace.emit("server_stats_update", lastStatsCache);
    }
  }, 1000); 

  setInterval(async () => {
    const serverNamespace = io?.of("/dashboard");

    if (serverNamespace && serverNamespace.sockets.size > 0 && !isFetching) {
      try {
        isFetching = true;
        const stats = await serverService.getFormattedStats();
        lastStatsCache = stats; 
        isFetching = false;
      } catch (error) {
        isFetching = false;
        console.error("Rate limit protection: holding last known stats");
      }
    }
  }, 20000); 

  setInterval(async () => {
    if (clientServers.size > 0) {
      for (const socketId of clientServers.keys()) {
        const socketInstance = getIO().sockets.sockets.get(
          socketId,
        ) as ILeaderboardSocket;
        if (socketInstance?.connected) {
          await leaderboardService.sendLeaderboard(socketInstance);
        } else {
          clientServers.delete(socketId);
        }
      }
    }
  }, 10000); 
};

export const getIO = (): Server => {
  if (!io) throw new BadRequestError("failed to initialize socket.io");

  return io;
};
