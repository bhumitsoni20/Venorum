import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';

/**
 * Get user cart
 * GET /api/cart
 */
export const getCart = async (req: any, res: Response) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add item to cart
 * POST /api/cart
 */
export const addToCart = async (req: any, res: Response) => {
  try {
    const { productId, quantity, isCustom, customDetails } = req.body;
    
    if (!isCustom) {
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
    }

    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId || undefined, quantity: quantity || 1, isCustom, customDetails }]
      });
    } else {
      let itemIndex = -1;
      
      if (!isCustom && productId) {
         itemIndex = cart.items.findIndex(item => item.product?.toString() === productId && !item.isCustom);
      }
      
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += (quantity || 1);
      } else {
        cart.items.push({ product: productId || undefined, quantity: quantity || 1, isCustom, customDetails } as any);
      }
      await cart.save();
    }
    
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update cart item quantity
 * PUT /api/cart/:productId
 */
export const updateCartItem = async (req: any, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }
    
    const itemIndex = cart.items.findIndex(item => item.product?.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      const updatedCart = await Cart.findById(cart._id).populate('items.product');
      res.status(200).json(updatedCart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/:productId
 */
export const removeFromCart = async (req: any, res: Response) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }
    
    cart.items = cart.items.filter(item => item.product?.toString() !== productId) as any;
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
export const clearCart = async (req: any, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
