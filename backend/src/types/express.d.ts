import { PersistedRole } from "../models/type";
interface UserPayload {
  userId: number;
  role: PersistedRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
