import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelper } from '../../helpers/jwtHelper';
import jwt from "jsonwebtoken";
import { token } from 'morgan';
import { User } from '../modules/user/user.model';
import Staff from '../modules/staff/staff.model';
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
    const token = req.header('Authorization')?.split(' ')[1];  // Get token from headers
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);


  
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      (req as any).admin = decoded;
  
      next(); 
    } catch (error) {
      console.error('Error decoding token:', error);
      res.status(403).json({ message: 'Invalid or expired token' });
    }
  };
  export const generateToken = (req: Request): string => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return token;
  };
  

  export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
  

      if (!tokenWithBearer || !tokenWithBearer.startsWith('Bearer')) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }
  
      const token = tokenWithBearer.split(' ')[1];
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
  
      if (!decoded || !decoded.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
      }
  

      req.user = decoded;
  
      next(); 
    } catch (error) {
      console.error('Error verifying token:', error);
      next(error);  
    }
  };


  export const authenticateStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
      if (!tokenWithBearer || !tokenWithBearer.startsWith('Bearer')) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }
  
      const token = tokenWithBearer.split(' ')[1];  // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };  // Verify token
  
      if (!decoded || !decoded.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
      }

  
      const staff = await Staff.findById(decoded.id);
      
      // Check if staff is found
      if (!staff) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Staff not found');
      }
  
      req.user = staff; // Attach staff to request
      next();
    } catch (error) {
      console.error('Error during staff authentication:', error);
      next(error);
    }
  };
  export default auth;

