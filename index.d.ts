import type { Request } from "express";
export interface Request extends Request {
  userId?: number;
}
