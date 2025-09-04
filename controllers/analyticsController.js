import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get dashboard analytics data
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({});
    const users = await User.find({});
    const products = await Product.find({});

    const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;

    // Sales over time (e.g., last 30 days)
    const salesData = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (salesData[date]) {
        salesData[date] += order.totalPrice;
      } else {
        salesData[date] = order.totalPrice;
      }
    });

    // Top selling products (simple count for now)
    const productSales = {};
    orders.forEach(order => {
      order.products.forEach(item => {
        if (productSales[item.name]) {
          productSales[item.name] += item.quantity;
        } else {
          productSales[item.name] = item.quantity;
        }
      });
    });
    const topSellingProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Top 5
      .map(([name, quantity]) => ({ name, quantity }));

    res.json({
      totalSales,
      totalOrders,
      totalUsers,
      totalProducts,
      salesData,
      topSellingProducts,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export { getDashboardAnalytics };
