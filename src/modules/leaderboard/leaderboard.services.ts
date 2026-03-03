import { NextFunction, Request, Response } from "express";
import {
  LeaderboardModel,
  LeaderboardRepository,
  SupportedEnum,
} from "../../DB";
import { BadRequestError, NotFoundError, successHandler } from "../../utils";

class LeaderboardServices {
  private leaderboardModel = new LeaderboardRepository(LeaderboardModel);

  getLeaderBoard = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { serverName } = req.query;

      const leaderboard = await this.leaderboardModel.find({
        filter: { serverName },
        sort: { "playTime.seconds": -1, is_online: -1 },
      });

      return successHandler({
        res,
        result: {
          leaderboard,
          pagination: {
            totalItems: leaderboard.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  searchPlayers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.query;

      if (!username) {
        throw new BadRequestError("Please provide a username to search");
      }

      const searchResult = await this.leaderboardModel.find({
        filter: { username: { $regex: username, $options: "i" } },
      });
      return successHandler({
        res,
        result: { searchResult },
      });
    } catch (error) {
      return next(error);
    }
  };

  toggleSupporter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;

      const player = await this.leaderboardModel.findOne({
        filter: { username },
      });

      if (!player) {
        throw new NotFoundError("Player not found");
      }

      const nextStatus = !player.isSupported?.status;
      const nextName = nextStatus
        ? SupportedEnum.SUPPORTED
        : SupportedEnum.UN_SUPPORTED;

       const updatedPlayer = await this.leaderboardModel.findOneAndUpdate({
        filter: { username },
        update: {
          $set: {
            "isSupported.status": nextStatus,
            "isSupported.name": nextName,
          },
        },
      });

      return successHandler({
        res,
        result: {
          newStatus: nextStatus,
          newName: nextName,
          username,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  deleteServer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serverName } = req.query;

      if (!serverName) {
        throw new BadRequestError("Server name is required");
      }

      const playersCount = await this.leaderboardModel.find({
        filter: { serverName: serverName as string },
      });

      if (playersCount.length === 0) {
        throw new NotFoundError("No players found for this server");
      }

      const deletedResult = await this.leaderboardModel.deleteMany({
        filter: { serverName: serverName as string },
      });

      return successHandler({
        res,
        message: `Successfully deleted all players from server: ${serverName}`,
        result: {
          deletedCount: deletedResult.deletedCount,
          acknowledged: deletedResult.acknowledged,
        },
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new LeaderboardServices();
