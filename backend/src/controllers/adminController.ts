import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      return;
    }

    // Run all queries in parallel for performance
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      revenueAgg,
      recentOrders,
      ordersByStatus,
      monthlyRevenueAgg,
    ] = await Promise.all([
      // Total order count
      Order.countDocuments(),

      // Total user count
      User.countDocuments(),

      // Total product count
      Product.countDocuments(),

      // Total revenue (sum of all totalPrice)
      Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, avgOrderValue: { $avg: '$totalPrice' } } },
      ]),

      // Recent 8 orders with user info
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(8)
        .select('orderItems totalPrice status isPaid createdAt user'),

      // Orders grouped by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Monthly revenue for the last 6 months
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$totalPrice' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const avgOrderValue = revenueAgg[0]?.avgOrderValue || 0;

    // Build status map
    const statusMap: Record<string, number> = {};
    for (const s of ordersByStatus) {
      statusMap[s._id] = s.count;
    }

    // Build monthly revenue array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = monthlyRevenueAgg.map((m: any) => ({
      month: monthNames[m._id.month - 1],
      year: m._id.year,
      revenue: m.revenue,
      orders: m.count,
    }));

    res.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        avgOrderValue: Math.round(avgOrderValue),
      },
      ordersByStatus: statusMap,
      monthlyRevenue,
      recentOrders: recentOrders.map((order: any) => ({
        _id: order._id,
        totalPrice: order.totalPrice,
        status: order.status,
        isPaid: order.isPaid,
        createdAt: order.createdAt,
        itemCount: order.orderItems?.length || 0,
        customerName: order.user?.name || 'Unknown',
        customerEmail: order.user?.email || '',
      })),
    });
  } catch (error: any) {
    console.error('Dashboard Stats Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
