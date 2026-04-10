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

// =============================================
// ADMIN: Order Management Endpoints
// =============================================

/**
 * Get all orders (Admin only)
 * GET /api/orders/admin/all
 */
export const adminGetAllOrders = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 15;
    const status = String(req.query.status || '');
    const search = String(req.query.search || '');
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    // If search term provided, filter in-memory (for customer name/email)
    let filteredOrders = orders;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = orders.filter((order: any) => {
        const userName = order.user?.name?.toLowerCase() || '';
        const userEmail = order.user?.email?.toLowerCase() || '';
        const orderId = order._id.toString().toLowerCase();
        return (
          userName.includes(searchLower) ||
          userEmail.includes(searchLower) ||
          orderId.includes(searchLower)
        );
      });
    }

    res.json({
      orders: filteredOrders,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update order status (Admin only)
 * PUT /api/orders/admin/:id/status
 */
export const adminUpdateOrderStatus = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    const { status, isPaid, isDelivered } = req.body;

    if (status !== undefined) {
      order.status = status;
    }

    if (isPaid !== undefined) {
      order.isPaid = isPaid;
      if (isPaid) {
        order.paidAt = new Date();
      }
    }

    if (isDelivered !== undefined) {
      order.isDelivered = isDelivered;
      if (isDelivered) {
        order.deliveredAt = new Date();
        order.status = 'Delivered';
      }
    }

    // Auto-set status logic
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    if (status === 'Cancelled') {
      order.isDelivered = false;
    }

    const updatedOrder = await order.save();
    const populated = await Order.findById(updatedOrder._id).populate('user', 'name email phone');

    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete order (Admin only)
 * DELETE /api/orders/admin/:id
 */
export const adminDeleteOrder = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
