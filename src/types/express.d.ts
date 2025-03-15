

import { IAdmin } from '../app/modules/Admin/admin.model';  // Adjust the path to where your Admin model is located
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;  // This adds the `admin` property to the `Request` type
    }
  }
}
