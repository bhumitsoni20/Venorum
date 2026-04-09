import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { sendResetPasswordEmail, sendVerificationEmail } from '../utils/emailService';
import path from 'path';
import dns from 'dns';


/**
 * Forgot Password — Initiates the password reset process.
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required.' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if user exists. Just say email sent.
      res.status(200).json({ message: 'If an account exists with that email, a reset link has been sent.' });
      return;
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    const emailSent = await sendResetPasswordEmail(user.email!, user.name, resetUrl);

    if (emailSent) {
      res.status(200).json({ message: 'Reset link sent to your email.' });
    } else {
      res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }

  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message || 'Forgot password process failed.' });
  }
};

/**
 * Reset Password — Updates the user's password using the token.
 * POST /api/auth/reset-password/:token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ message: 'New password is required.' });
      return;
    }

    // Hash the token provided in the URL to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired password reset token.' });
      return;
    }

    // Set new password (also hash it with bcrypt)
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);
    
    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });

  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Password reset failed.' });
  }
};


// Force Google DNS for Firebase token verification (same fix as MongoDB)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Initialize Firebase Admin SDK with service account key
try {
  if (!admin.apps.length) {
    const serviceAccount = require(path.join(process.cwd(), 'serviceAccountKey.json'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized successfully.");
  }
} catch (error: any) {
  console.error("Firebase Admin init error:", error.message);
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
       console.log("Verifying token, length:", token.length);
       decodedToken = await admin.auth().verifyIdToken(token);
       console.log("Token verified for uid:", decodedToken.uid);
    } catch(err: any) {
       console.error("Token verification failed:", err.code, err.message);
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

/**
 * Admin Login — email/password based authentication.
 * Verifies against credentials stored in environment variables.
 * POST /api/auth/admin/login
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      res.status(500).json({ message: 'Admin credentials not configured on server.' });
      return;
    }

    // Verify email matches configured admin
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      res.status(401).json({ message: 'Invalid admin credentials.' });
      return;
    }

    // Verify password against bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid admin credentials.' });
      return;
    }

    // Find or create admin user in MongoDB
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Venorum Admin',
        email: adminEmail,
        firebaseUid: `admin-${Date.now()}`,
        role: 'admin',
      });
    }

    // Ensure role is admin
    if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      await adminUser.save();
    }

    // Return JWT token + user profile
    const token = generateToken(adminUser._id.toString());

    res.status(200).json({
      _id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      token,
    });

  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: error.message || 'Admin login failed.' });
  }
};

/**
 * Register — Custom signup flow with professional verification email.
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists.' });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, email, passwordHash, role: 'user', firebaseUid: `unverified-${Date.now()}`
    });

    const verifyToken = user.generateResetToken();
    await user.save();

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
    await sendVerificationEmail(email, name, verifyUrl);

    res.status(201).json({ message: 'Membership verification email sent.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Verify Email
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid token.' });

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Account verified!' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

