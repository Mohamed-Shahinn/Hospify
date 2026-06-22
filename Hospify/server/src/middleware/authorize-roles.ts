import type { RequestHandler } from "express";

import { AppError } from "../errors/app-error";
import type { UserRole } from "../models/user.model";

export const authorizeRoles = (...allowedRoles: readonly UserRole[]): RequestHandler =>
  (request, _response, next) => {
    if (!request.user) {
      next(new AppError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      next(new AppError(403, "You do not have permission to access this resource"));
      return;
    }

    next();
  };
