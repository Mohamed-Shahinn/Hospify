import type { RequestHandler } from "express";

import { verifyAccessToken } from "../config/jwt";
import { AppError } from "../errors/app-error";

const BEARER_TOKEN_PATTERN = /^Bearer\s+(.+)$/i;

export const authenticate: RequestHandler = (request, _response, next) => {
  const authorization = request.header("authorization");
  const token = authorization?.match(BEARER_TOKEN_PATTERN)?.[1]?.trim();

  if (!token) {
    next(new AppError(401, "Authentication token is required"));
    return;
  }

  try {
    request.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired authentication token"));
  }
};
