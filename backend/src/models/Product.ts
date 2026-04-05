import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  user: mongoose.Schema.Types.ObjectId;
  category: mongoose.Schema.Types.ObjectId;
  name: string;
  image: string;
  description: string;
  price: number;
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
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
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
