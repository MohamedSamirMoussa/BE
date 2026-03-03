import { Model, QueryOptions, Types, UpdateQuery } from "mongoose";
import { DBrepository } from "./db.repository";
import { IBlogSchema } from "../models/blog.model";

export class BlogRepository extends DBrepository<IBlogSchema> {
  constructor(protected override readonly model: Model<IBlogSchema>) {
    super(model);
  }


  async findByIdAndDelete({
    id,
    options
  }:{
    id:Types.ObjectId
    options?:QueryOptions<IBlogSchema>
  }) {
    return this.model.findByIdAndDelete(id , options)
  }

  async findByIdAndUpdate({
    id,
    update,
    options
  } : {
    id:Types.ObjectId;
    update:UpdateQuery<Partial<IBlogSchema>>;
    options?:QueryOptions<IBlogSchema>
  }) {
    return this.model.findByIdAndUpdate(id , update , options)
  }

}
