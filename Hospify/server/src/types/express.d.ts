import type { AuthenticatedUser } from "../config/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
