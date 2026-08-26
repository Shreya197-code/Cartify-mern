const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Total Revenue (only paid orders or all completed orders)
    const totalRevenueAgg = await Order.aggregate([
      {
        $match: {
          $or: [
            { paymentStatus: 'paid' },
            { status: 'delivered' }
          ]
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].revenue : 0;

    // Monthly Revenue Trend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const revenueOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          $or: [
            { paymentStatus: 'paid' },
            { status: 'delivered' }
          ]
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          ordersCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format revenue data with readable month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedRevenue = revenueOverTime.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.ordersCount
    }));

    // Orders By Status Distribution
    const ordersByStatusAgg = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const ordersByStatus = ordersByStatusAgg.map(item => ({
      name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
      value: item.count
    }));

    // Top Selling Products
    const topProductsAgg = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 1,
          name: '$productDetails.name',
          category: '$productDetails.category',
          imageUrl: '$productDetails.imageUrl',
          price: '$productDetails.price',
          stock: '$productDetails.stock',
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Low Stock Alert Products (stock <= 5)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select('name category stock price imageUrl')
      .limit(10);

    // Recent Orders (Last 5)
    const recentOrders = await Order.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        revenueOverTime: formattedRevenue,
        ordersByStatus,
        topSellingProducts: topProductsAgg,
        lowStockProducts,
        recentOrders
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics
};