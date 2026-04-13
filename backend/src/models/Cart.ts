import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem extends Document {
  product?: mongoose.Schema.Types.ObjectId;
  quantity: number;
  isCustom?: boolean;
  customDetails?: any;
}

export interface ICart extends Document {
  user: mongoose.Schema.Types.ObjectId;
  items: ICartItem[];
}

const cartItemSchema: Schema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  isCustom: { type: Boolean, default: false },
  customDetails: { type: Object },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
});

const cartSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;
