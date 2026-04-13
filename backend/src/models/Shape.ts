import mongoose, { Document, Schema } from 'mongoose';

export interface IShape extends Document {
  name: string;
  multiplier: number;
  icon: string;
}

const shapeSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    multiplier: { type: Number, required: true, default: 1.0 },
    icon: { type: String, default: '●' }
  },
  { timestamps: true }
);

const Shape = mongoose.model<IShape>('Shape', shapeSchema);
export default Shape;
