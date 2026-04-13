import mongoose, { Document, Schema } from 'mongoose';

export interface IGem extends Document {
  name: string;
  pricePerCarat: number;
  image: string;
  color: string;
  description: string;
  allowedShapes: string[];
}

const gemSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    pricePerCarat: { type: Number, required: true, default: 0 },
    image: { type: String, default: '' },
    color: { type: String, default: '' },
    description: { type: String, default: '' },
    allowedShapes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Gem = mongoose.model<IGem>('Gem', gemSchema);
export default Gem;
