const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const totalRevenueAgg = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: '$totalAmount'
          }
        }
      }
    ]);

    const totalRevenue =
      totalRevenueAgg.length > 0
        ? totalRevenueAgg[0].revenue
        : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics
};