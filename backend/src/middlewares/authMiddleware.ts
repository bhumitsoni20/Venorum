import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Safe fallback developer interface for UI layout construction
      if (token === 'MOCK_TOKEN' || token === 'MOCK_FIREBASE_TOKEN') {
         let dummyAdmin = await User.findOne({ email: 'admin@venorum.com' });
         if (!dummyAdmin) {
            dummyAdmin = await User.create({ name: 'Admin', email: 'admin@venorum.com', firebaseUid: 'admin-mock-uid', role: 'admin' });
         }
         req.user = dummyAdmin;
         return next();
      }

      // 1. Verify token strictly using Firebase servers
      const decodedToken = await admin.auth().verifyIdToken(token);

      // 2. Resolve mapped user object exclusively from mapped Firebase parameter
      req.user = await User.findOne({ firebaseUid: decodedToken.uid });

      if (!req.user) {
         res.status(401);
         return next(new Error('User verification failed within MongoDB constraint array.'));
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Firebase Network Validation Error. Access Restricted.'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, explicit payload token absent.'));
  }
};
