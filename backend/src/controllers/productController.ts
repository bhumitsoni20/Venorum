import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Product from '../models/Product';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, images, video, arModelUrl, description, pricingBreakdown, gems, category, countInStock } = req.body;
    
    const product = new Product({
      user: req.user._id,
      name: name || 'Sample Piece',
      price: price || 0,
      images: images || [],
      video: video || '',
      arModelUrl: arModelUrl || '',
      description: description || 'Legacy narrative.',
      pricingBreakdown: pricingBreakdown || [],
      gems: gems || [],
      category,
      countInStock: countInStock || 0,
      numReviews: 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({}).populate('category', 'name mainCategory slug');
    res.json(products);
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name mainCategory slug');

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, description, images, video, arModelUrl, pricingBreakdown, gems, category, countInStock } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.images = images || product.images;
      product.video = video || product.video;
      product.arModelUrl = arModelUrl || product.arModelUrl;
      product.pricingBreakdown = pricingBreakdown || product.pricingBreakdown;
      product.gems = gems || product.gems;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};
