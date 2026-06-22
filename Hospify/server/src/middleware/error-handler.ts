import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/app-error";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details ? { errors: error.details } : {}),
    });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
    return;
  }

  console.error("Unhandled request error", error);
  response.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
