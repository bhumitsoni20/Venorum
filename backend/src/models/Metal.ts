import mongoose, { Document, Schema } from 'mongoose';

export interface IMetal extends Document {
  name: string;
  type: string; // e.g., 'Gold', 'Silver'
  pricePerGram: number; // can be updated periodically from live rates
  hex: string;
  icon: string;
  priceHint: string;
}

const metalSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    pricePerGram: { type: Number, required: true, default: 0 },
    hex: { type: String, default: '#D4AF37' },
    icon: { type: String, default: '✦' },
    priceHint: { type: String, default: '' },
  },
  { timestamps: true }
);

const Metal = mongoose.model<IMetal>('Metal', metalSchema);
export default Metal;
