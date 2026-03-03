import {
  Model,
  MongooseUpdateQueryOptions,
  UpdateQuery,
} from "mongoose";
import { DBrepository } from "./db.repository";
import { IPageContent } from "../models/PageContent.model";

export class PageContentRepository extends DBrepository<IPageContent> {
  constructor(protected override readonly model: Model<IPageContent>) {
    super(model);
  }

  updateMany({
    filter = {},
    update,
    options,
  }: {
    filter: any;
    update: UpdateQuery<IPageContent>;
    options?: MongooseUpdateQueryOptions<IPageContent>;
  }) {
    return this.model.updateMany(filter, update, options);
  }
}
