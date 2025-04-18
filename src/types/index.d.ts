import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}
// import { JwtPayload } from "jsonwebtoken";

// interface CustomRequest extends Request {
//   user: JwtPayload & { id: string }; // Extend JwtPayload to include the id field
// }