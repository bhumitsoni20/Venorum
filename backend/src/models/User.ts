import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  firebaseUid: string;
  role: 'user' | 'admin';
  passwordHash?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  generateResetToken(): string;
}

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      default: 'Unknown User',
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    passwordHash: {
      type: String,
      select: false, // Don't return in queries by default
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Generates a cryptographically secure reset token,
 * stores the hashed version in the database, and
 * returns the raw token for the email link.
 */
userSchema.methods.generateResetToken = function (): string {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return rawToken;
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
