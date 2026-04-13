import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomization extends Document {
  user: mongoose.Schema.Types.ObjectId;
  product: mongoose.Schema.Types.ObjectId;
  metal: string;
  gem: string;
  shape: string;
  story: {
    message: string;
    date: string;
    initials: string;
  };
  price: {
    metalPrice: number;
    gemPrice: number;
    makingCharges: number;
    total: number;
  };
  addedToCart: boolean;
}

const customizationSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    metal: { type: String, required: true },
    gem: { type: String, required: true },
    shape: { type: String, required: true },
    story: {
      message: { type: String, default: '' },
      date: { type: String, default: '' },
      initials: { type: String, default: '' },
    },
    price: {
      metalPrice: { type: Number, default: 0 },
      gemPrice: { type: Number, default: 0 },
      makingCharges: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    addedToCart: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Customization = mongoose.model<ICustomization>('Customization', customizationSchema);
export default Customization;
