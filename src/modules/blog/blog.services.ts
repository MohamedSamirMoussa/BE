import { NextFunction, Request, Response } from "express";
import { BlogRepository } from "../../DB/DBrepository/blog.repository";
import { BlogModel } from "../../DB/models/blog.model";
import {
  BadRequestError,
  ConflictError,
  NotAuthorizedError,
  successHandler,
} from "../../utils";
import {
  deleteFileInCloudinary,
  uploadFileInCloudinary,
} from "../../utils/multer/cloudinary";
import { Types } from "mongoose";
import { RoleEnum } from "../../DB";

class BlogServices {
  private blogModel = new BlogRepository(BlogModel);
  constructor() {}

  createBlog = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      if (!req.user)
        throw new ConflictError("Not authorized user ... Please login first");

      const { title, description } = req.body;

      if (!req.file) {
        throw new BadRequestError("Please upload an image for the blog");
      }

      const { secure_url, public_id } = await uploadFileInCloudinary({
        file: req.file,
        path: `/${req.user._id}_${req.user?.username}`,
      });

      const [blog] =
        (await this.blogModel.create({
          data: [
            {
              title,
              description,
              userId: req.user._id,
              image: { secure_url, public_id },
            },
          ],
          options: { validateBeforeSave: true },
        })) || [];

      if (!blog)
        throw new BadRequestError("Something went wrong please post again");

      const populatedBlog = await this.blogModel.findById({
        id: blog._id,
        populate: [{ path: "userId", select: "username email" }],
      });

      return successHandler({
        res,
        message: "Blog Posted Successfully",
        result: { populatedBlog },
      });
    } catch (error) {
      next(error);
    }
  };

  getBlogs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { month } = req.query;

      let filter: any = {};

      if (month && typeof month === "string" && month !== "undefined") {
        const startDate = new Date(`${month}-01T00:00:00Z`);
        const endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0,
          23,
          59,
          59,
        );
        filter.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      const result = await this.blogModel.find({
        filter,
        populate: [{ path: "userId", select: "username email" }],
      });
      return successHandler({ res, result });
    } catch (error) {
      next(error);
    }
  };

  deleteBlog = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const userRole = req.user?.role;
      const blog = await this.blogModel.findOne({
        filter: { _id: id },
      });
      if (!blog) {
        throw new BadRequestError("Blog not found");
      }
      const isOwner = blog?.userId?._id.toString() === userId?.toString();
      const isAdmin =
        userRole === RoleEnum.admin || userRole === RoleEnum.super;

      if (!isOwner && !isAdmin)
        throw new NotAuthorizedError(
          "You don't have permission to delete this blog",
        );

      const public_id = blog.image?.public_id;

      if (public_id) {
        await deleteFileInCloudinary(public_id as string);
      }

      await this.blogModel.findByIdAndDelete({
        id: blog._id as unknown as Types.ObjectId,
      });

      return successHandler({ res, message: "Blog deleted successfully" });
    } catch (error: any) {
      return next(error as any);
    }
  };

  updateBlog = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { blogId } = req.params;
      const { title, description } = req.body;
      const userId = req.user?._id;
      const userRole = req.user?.role;
      if (!title && !description)
        throw new BadRequestError(
          "Please provide title or description to update",
        );

      const blog = await this.blogModel.findById({
        id: blogId as unknown as Types.ObjectId,
      });
      if (!blog) throw new BadRequestError("Blog not found");

      const isOwner = blog?.userId?._id.toString() === userId?.toString();
      const isAdmin =
        userRole === RoleEnum.admin || userRole === RoleEnum.super;

      if (!isOwner && !isAdmin)
        throw new NotAuthorizedError(
          "You don't have permission to update this blog",
        );

      const updatedBlog = await this.blogModel.findByIdAndUpdate({
        id: blogId as unknown as Types.ObjectId,
        update: { $set: { title, description } },
        options: { new: true, runValidators: true },
      });

      return successHandler({
        res,
        message: "Blog updated successfully",
        result: { updatedBlog },
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new BlogServices();
