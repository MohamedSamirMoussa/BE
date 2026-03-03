import { NextFunction, Request, Response } from "express";
import { PageContentModel, PageContentRepository, RoleEnum } from "../../DB";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  successHandler,
} from "../../utils";

class PageContentServices {
  private pageModel = new PageContentRepository(PageContentModel);

  constructor() {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sectionName } = req.params;
      if (!sectionName) throw new BadRequestError("Section Name are required");
      const section = await this.pageModel.findOne({
        filter: { sectionName },
      });

      if (!sectionName) throw new NotFoundError("Section not found");

      return successHandler({ res, result: { section } });
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (
        req.user?.role !== RoleEnum.super &&
        req.user?.role !== RoleEnum.admin
      ) {
        throw new NotAuthorizedError("User unauthorized");
      }

      const { sectionName } = req.params;

      if (!sectionName) throw new BadRequestError("Section Name is required");

      const updatedSection = await this.pageModel.findOneAndUpdate({
        filter: { sectionName },
        update: {
          $set: { ...req.body },
        },
        options: {
          new: true,
          upsert: true,
          runValidators: true,
        },
      });

      return successHandler({
        res,
        message: `${sectionName} updated successfully`,
        result: { section: updatedSection },
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new PageContentServices();
