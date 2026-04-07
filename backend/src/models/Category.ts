import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  mainCategory: string; // "Women's", "Men's", "Kids"
  description?: string;
  slug: string;
}

const categorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mainCategory: {
      type: String,
      enum: ["Women's", "Men's", "Kids"],
      required: true,
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
