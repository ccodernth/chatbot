// services/dashboardService.js
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

class DashboardService {
  // Ana dashboard istatistikleri
  async getDashboardStats() {
    try {
      // Paralel olarak tüm istatistikleri al
      const [
        orderStats,
        productStats,
        userStats,
        revenueStats,
        recentOrders,
        topProducts
      ] = await Promise.all([
        this.getOrderStats(),
        this.getProductStats(),
        this.getUserStats(),
        this.getRevenueStats(),
        this.getRecentOrders(5),
        this.getTopSellingProducts(5)
      ]);

      return {
        overview: {
          totalRevenue: revenueStats.total,
          totalOrders: orderStats.total,
          totalProducts: productStats.total,
          totalUsers: userStats.total
        },
        orders: orderStats,
        products: productStats,
        users: userStats,
        revenue: revenueStats,
        recentOrders,
        topProducts
      };
    } catch (error) {
      throw new Error(`Dashboard istatistikleri alınırken hata: ${error.message}`);
    }
  }

  // Sipariş istatistikleri
  async getOrderStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const [total, pending, processing, completed, todayCount, monthCount] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'processing' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.countDocuments({ createdAt: { $gte: thisMonth } })
      ]);

      return {
        total,
        pending,
        processing,
        completed,
        todayCount,
        monthCount,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new Error(`Sipariş istatistikleri hatası: ${error.message}`);
    }
  }

  // Ürün istatistikleri
  async getProductStats() {
    try {
      const [total, active, outOfStock, lowStock] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ inStock: true }),
        Product.countDocuments({ stock: 0 }),
        Product.countDocuments({ stock: { $gt: 0, $lte: 10 } })
      ]);

      return {
        total,
        active,
        outOfStock,
        lowStock,
        activeRate: total > 0 ? ((active / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new Error(`Ürün istatistikleri hatası: ${error.message}`);
    }
  }

  // Kullanıcı istatistikleri
  async getUserStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const [total, active, newToday, newThisMonth] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ createdAt: { $gte: thisMonth } })
      ]);

      return {
        total,
        active,
        inactive: total - active,
        newToday,
        newThisMonth,
        activeRate: total > 0 ? ((active / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new Error(`Kullanıcı istatistikleri hatası: ${error.message}`);
    }
  }

  // Gelir istatistikleri
  async getRevenueStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(1);
      lastMonth.setHours(0, 0, 0, 0);

      // Toplam gelir
      const totalRevenue = await Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'returned'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      // Bugünkü gelir
      const todayRevenue = await Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: today },
            status: { $nin: ['cancelled', 'returned'] }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      // Bu ayki gelir
      const monthRevenue = await Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: thisMonth },
            status: { $nin: ['cancelled', 'returned'] }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      // Geçen ayki gelir
      const lastMonthRevenue = await Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: lastMonth, $lt: thisMonth },
            status: { $nin: ['cancelled', 'returned'] }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      const currentMonth = monthRevenue[0]?.total || 0;
      const previousMonth = lastMonthRevenue[0]?.total || 0;
      const growthRate = previousMonth > 0 
        ? (((currentMonth - previousMonth) / previousMonth) * 100).toFixed(2)
        : 0;

      return {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        thisMonth: currentMonth,
        lastMonth: previousMonth,
        growthRate,
        currency: 'TRY'
      };
    } catch (error) {
      throw new Error(`Gelir istatistikleri hatası: ${error.message}`);
    }
  }

  // Son siparişler
  async getRecentOrders(limit = 10) {
    try {
      const orders = await Order.find()
        .sort('-createdAt')
        .limit(limit)
        .populate('user', 'name email')
        .populate('items.product', 'name')
        .select('orderNumber totalAmount status createdAt user items');

      return orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.user?.name || 'Misafir',
        totalAmount: order.totalAmount,
        status: order.status,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        date: order.createdAt
      }));
    } catch (error) {
      throw new Error(`Son siparişler hatası: ${error.message}`);
    }
  }

  // En çok satan ürünler
  async getTopSellingProducts(limit = 10) {
    try {
      const topProducts = await Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'returned'] } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' }
      ]);

      return topProducts.map(item => ({
        product: {
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          imageUrl: item.product.imageUrl
        },
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue
      }));
    } catch (error) {
      throw new Error(`En çok satan ürünler hatası: ${error.message}`);
    }
  }

  // Satış grafiği verileri (son 30 gün)
  async getSalesChartData(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const salesData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $nin: ['cancelled', 'returned'] }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Eksik günleri doldur
      const filledData = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= new Date()) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayData = salesData.find(item => item._id === dateStr);
        
        filledData.push({
          date: dateStr,
          revenue: dayData?.totalRevenue || 0,
          orders: dayData?.orderCount || 0
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return filledData;
    } catch (error) {
      throw new Error(`Satış grafiği verileri hatası: ${error.message}`);
    }
  }

  // Kategori bazlı satış dağılımı
  async getCategorySalesDistribution() {
    try {
      const categoryData = await Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'returned'] } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            totalRevenue: { $sum: '$items.totalPrice' },
            totalQuantity: { $sum: '$items.quantity' }
          }
        }
      ]);

      return categoryData;
    } catch (error) {
      throw new Error(`Kategori dağılımı hatası: ${error.message}`);
    }
  }
}

module.exports = new DashboardService();
