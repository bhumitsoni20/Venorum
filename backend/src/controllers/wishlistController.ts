import { Request, Response } from 'express';
import Wishlist from '../models/Wishlist';

/**
 * Get user wishlist
 * GET /api/wishlist
 */
export const getWishlist = async (req: any, res: Response) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json(wishlist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add product to wishlist
 * POST /api/wishlist/:productId
 */
export const addToWishlist = async (req: any, res: Response) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    } else {
      // Check if already in wishlist
      if (wishlist.products.includes(productId)) {
        res.status(400).json({ message: 'Product already in wishlist' });
        return;
      }
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.status(201).json(wishlist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Remove product from wishlist
 * DELETE /api/wishlist/:productId
 */
export const removeFromWishlist = async (req: any, res: Response) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      res.status(404).json({ message: 'Wishlist not found' });
      return;
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );

    await wishlist.save();
    res.json(wishlist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
