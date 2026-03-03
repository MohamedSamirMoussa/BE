import { Model, QueryFilter, QueryOptions } from "mongoose";
import { DBrepository } from "./db.repository";
import { ILeaderboardUser } from "../models/leaderboard.model";
import { MongooseBaseQueryOptions } from "mongoose";

export class LeaderboardRepository extends DBrepository<ILeaderboardUser> {
  constructor(protected override readonly model: Model<ILeaderboardUser>) {
    super(model);
  }

  countDocuments({
    filter,
    options,
  }: {
    filter: QueryFilter<ILeaderboardUser>;
    options?: MongooseBaseQueryOptions<ILeaderboardUser>;
  }) {
    return this.model.countDocuments(filter, options);
  }

  deleteMany({
    filter,
    options,
  }: {
    filter: any;
    options?: QueryOptions<ILeaderboardUser> | null;
  }) {
    return this.model.deleteMany(filter, options as any);
  }
}
