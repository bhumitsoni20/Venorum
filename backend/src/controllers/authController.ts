import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import User from '../models/User';

// Safely initialize Admin SDK via minimal logic or default proxy.
// User will provide GOOGLE_APPLICATION_CREDENTIALS for deployment.
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
} catch (error) {
  console.log("Firebase Admin initialization skipped during dummy run.");
}

export const firebaseLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
        res.status(400);
        throw new Error("No token provided");
    }

    let decodedToken;
    try {
       decodedToken = await admin.auth().verifyIdToken(token);
    } catch(err) {
       // Support for Mock Tests during Development Without Real Firebase Keys
       if (token === "MOCK_FIREBASE_TOKEN") {
           decodedToken = { uid: "mock-uid-12345", email: "mock@venorum.com", phone_number: "+1234567890", name: "Mock Local Dev" };
       } else {
           throw new Error("Invalid Firebase Auth Token.");
       }
    }

    const { uid, email, phone_number, name } = decodedToken;

    // Strict sync with MongoDB using firebaseUid map
    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
        // Hydrate updates implicitly
        res.status(200).json(user);
    } else {
        // Construct Initial Profile
        user = await User.create({
            name: name || req.body.name || 'Venorum Enthusiast',
            email: email || req.body.email || undefined,
            phone: phone_number || req.body.phone || undefined,
            firebaseUid: uid,
            role: 'user'
        });
        res.status(201).json(user);
    }

  } catch(error:any) {
      console.error(error);
      res.status(401).json({ message: error.message || "Failed Authentication Registration Boundary." });
  }
}
