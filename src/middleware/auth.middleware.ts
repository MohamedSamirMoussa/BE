import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  decodeToken,
  NotAuthorizedError,
  SignatureEnumLevels,
  TokenEnum,
} from "../utils";
import { RoleEnum } from "../DB";

export const authentication = (tokenType: TokenEnum = TokenEnum.access) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let authHeader = req.headers.authorization;

    if (!authHeader) {
      const tokenName =
        tokenType === TokenEnum.refresh ? "refresh_token" : "access_token";
      const tokenInCookie = req.cookies[tokenName];

      if (tokenInCookie) {
        const sigLevel =
          req.cookies.signature_level || SignatureEnumLevels.Bearer;
        authHeader = `${sigLevel} ${tokenInCookie}`;
      }
    }

    if (!authHeader)
      throw new BadRequestError("Session is expired please login again");

    const { user, decode } = await decodeToken({
      authorization: authHeader,
      tokenType,
    });

    req.user = user;
    req.decode = decode;

    next();
  };
};

export const authorization = (roles: RoleEnum[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new NotAuthorizedError("Please login first");
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(
        new NotAuthorizedError(
          "Access denied: You don't have the required role",
        ),
      );
    }
    next();
  };
};
