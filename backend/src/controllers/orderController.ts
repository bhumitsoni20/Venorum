import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';

/**
 * Create new order
 * POST /api/orders
 */
export const addOrderItems = async (req: any, res: Response) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();
      
      // Clear cart after order is placed
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

      res.status(201).json(createdOrder);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get logged in user orders
 * GET /api/orders/myorders
 */
export const getMyOrders = async (req: any, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Check if user is owner or admin
      if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
