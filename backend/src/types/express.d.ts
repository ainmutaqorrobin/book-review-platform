import type { Logger } from "pino";
import { PersistedRole } from "../models/type";

interface UserPayload {
  userId: number;
  role: PersistedRole;
}

declare global {
  namespace Express {
    interface Request {
      id?: string;
      log?: Logger;
      user?: UserPayload;
      file?: Express.Multer.File;
    }
  }
}

export {};
