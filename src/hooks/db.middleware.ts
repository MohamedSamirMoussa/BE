import { BadRequestError } from "../utils";

export enum OperationEnum {
  save = "save",
  findOneAndDelete = "findOneAndDelete",
  deleteOne = "deleteOne",
  deleteMany = "deleteMany",
  updateOne = "updateOne",
  findOneAndUpdate = "findOneAndUpdate",
}

interface IMiddlewareConfig {
  schema: any;
  model: any;
  operation: OperationEnum;
  notificationType: any;
  getMessage: (doc: any) => string;
  condition?: (doc: any) => boolean;
}

export const applyNotificationHook = (config: IMiddlewareConfig) => {
  const { schema, model, operation, notificationType, getMessage, condition } =
    config;

  schema.post(operation, async function (doc: any) {
    try {
      if (!doc) throw new BadRequestError("Messing Document");

      if (condition && !condition(doc)) return;

      await model.create({
        type: notificationType,
        message: getMessage(doc),
        metadata: {
          targetId: doc._id,
          details: doc.username || doc.title || "No details provided",
          action: operation.includes("Delete") ? "delete" : "update/create",
        },
      });
    } catch (error) {
      throw new BadRequestError("Something went wrong", { cause: error });
    }
  });
};
