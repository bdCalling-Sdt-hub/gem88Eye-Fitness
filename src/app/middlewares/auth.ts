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


  // export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  //   const token = req.header("Authorization")?.split(" ")[1];  // Get token from headers
  //   if (!token) return res.status(401).json({ message: "Unauthorized" });
  
  //   try {
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  //     console.log(decoded); // Check the decoded token for admin ID
  //     (req as any).admin = decoded; // Attach the decoded admin data to req.admin
  //     next();
  //   } catch (error) {
  //     res.status(403).json({ message: "Invalid or expired token" });
  //   }
  // };

  
  // Ensure that the 'user' object is defined or passed before this block
  
  export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Get token from headers
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      // Decode the token using jwt.verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  
      // Log the decoded token for debugging purposes
      console.log('Decoded token:', decoded);
  
      // Ensure the decoded token contains an ID (the user ID)
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      // Attach decoded data (admin) to the request object for later use
      (req as any).admin = decoded;  // Attach the decoded admin data to req.admin
  
      next();  // Continue to the next middleware or route handler
    } catch (error) {
      console.error('Error decoding token:', error);
      res.status(403).json({ message: 'Invalid or expired token' });
    }
  };
  export const generateToken = (req: Request): string => {
    const user = req.user; // Assuming 'req.user' contains the user object

    const token = jwt.sign(
      { id: user._id, role: user.role },  // Ensure that user._id is correctly set in the token
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return token;
  };
  

  export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
  
      // If the token is not provided, return an error
      if (!tokenWithBearer || !tokenWithBearer.startsWith('Bearer')) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }
  
      const token = tokenWithBearer.split(' ')[1];  // Extract the token from 'Bearer <token>'
  
      // Verify the token and decode it
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
  
      if (!decoded || !decoded.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
      }
  
      // Attach the decoded user data (user ID) to the request
      req.user = decoded;
  
      next();  // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Error verifying token:', error);
      next(error);  // Pass errors to the error handling middleware
    }
  };

  export const authenticateStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
  
      // If the token is not provided, return an error
      if (!tokenWithBearer || !tokenWithBearer.startsWith('Bearer')) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }
  
      const token = tokenWithBearer.split(' ')[1];  // Extract the token from 'Bearer <token>'
  
      // Verify the token and decode it
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
  
      // Check if the decoded token contains the ID
      if (!decoded || !decoded.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
      }
  
      // Debugging: Log the decoded token to check the ID
      console.log('Decoded token:', decoded);
  
      // Fetch the staff using the decoded ID
      const staff = await Staff.findById(decoded.id);
  
      if (!staff) {
        console.error(`Staff with ID ${decoded.id} not found in database.`);
        throw new ApiError(StatusCodes.NOT_FOUND, 'Staff not found');
      }
  
      // Attach the staff to the request object for later use
      req.user = staff;
      next();  // Continue to the next middleware or route handler
    } catch (error) {
      console.error('Error verifying token:', error);
      next(error);  // Pass errors to the error handling middleware
    }
  };

  export default auth;

