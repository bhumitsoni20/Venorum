import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  firebaseUid: string;
  role: 'user' | 'admin';
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
