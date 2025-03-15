import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelper } from '../../helpers/jwtHelper';
import jwt from "jsonwebtoken";
import { token } from 'morgan';

const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
      
      if (!tokenWithBearer) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
        const token = tokenWithBearer.split(' ')[1];

        // Verify token using jwtHelper
        const verifyUser = jwtHelper.verifyToken(token, config.jwt.jwt_secret as Secret);

        // Set user to header
        req.user = verifyUser;

        // Guard user by role
        if (roles.length && !roles.includes(verifyUser.role)) {
          throw new ApiError(StatusCodes.FORBIDDEN, "You don't have permission to access this API");
        }

        next();
      }
    } catch (error) {
      next(error);
    }
  };


  export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];  // Get token from headers
    if (!token) return res.status(401).json({ message: "Unauthorized" });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      console.log(decoded); // Check the decoded token for admin ID
      (req as any).admin = decoded; // Attach the decoded admin data to req.admin
      next();
    } catch (error) {
      res.status(403).json({ message: "Invalid or expired token" });
    }
  };
  

  export default auth;

