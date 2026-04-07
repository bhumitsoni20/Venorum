import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  user: mongoose.Schema.Types.ObjectId;
  category: mongoose.Schema.Types.ObjectId;
  name: string;
  images: string[];
  video?: string;
  arModelUrl?: string;
  description: string;
  pricingBreakdown: { id: number; label: string; value: string }[];
  price: number;
  gems: string[];
  countInStock: number;
  rating?: number;
  numReviews?: number;
}

const productSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    name: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
    },
    arModelUrl: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    pricingBreakdown: {
      type: [Object],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    gems: {
      type: [String],
      default: [],
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
