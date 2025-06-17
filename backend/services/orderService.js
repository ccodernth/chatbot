// services/orderService.js
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const productService = require('./productService');
const emailService = require('./emailService');

class OrderService {
  // Sipariş oluştur
  async createOrder(orderData, userId) {
    try {
      // Ürünleri kontrol et ve toplam tutarı hesapla
      const { items, totalAmount } = await this.validateAndCalculateOrder(orderData.items);

      // Sipariş numarası oluştur
      const orderNumber = await this.generateOrderNumber();

      // Siparişi oluştur
      const order = new Order({
        orderNumber,
        user: userId,
        items,
        totalAmount,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentDetails: orderData.paymentDetails,
        notes: orderData.notes
      });

      await order.save();

      // Stokları güncelle
      await this.updateProductStocks(items);

      // Kullanıcının sipariş referansını ekle
      await User.findByIdAndUpdate(userId, {
        $push: { orders: order._id }
      });

      // Email bildirimi gönder
      const populatedOrder = await order.populate('user', 'name email');
      await emailService.sendOrderConfirmation(populatedOrder);

      return order;
    } catch (error) {
      throw new Error(`Sipariş oluşturulurken hata: ${error.message}`);
    }
  }

  // Sipariş detayını getir
  async getOrderById(orderId, userId = null) {
    try {
      let query = Order.findById(orderId)
        .populate('user', 'name email phone')
        .populate('items.product', 'name price imageUrl');

      // Eğer userId varsa, kullanıcının kendi siparişi mi kontrol et
      if (userId) {
        const order = await query;
        if (order.user._id.toString() !== userId && order.user.role !== 'admin') {
          throw new Error('Bu siparişi görüntüleme yetkiniz yok');
        }
        return order;
      }

      return await query;
    } catch (error) {
      throw new Error(`Sipariş getirilirken hata: ${error.message}`);
    }
  }

  // Kullanıcının siparişlerini getir
  async getUserOrders(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const orders = await Order.find({ user: userId })
        .sort('-createdAt')
        .limit(limit)
        .skip(skip)
        .populate('items.product', 'name price imageUrl');

      const total = await Order.countDocuments({ user: userId });

      return {
        orders,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      };
    } catch (error) {
      throw new Error(`Siparişler getirilirken hata: ${error.message}`);
    }
  }

  // Tüm siparişleri getir (Admin için)
  async getAllOrders(filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = this.buildOrderQuery(filters);

      const orders = await Order.find(query)
        .sort('-createdAt')
        .limit(limit)
        .skip(skip)
        .populate('user', 'name email')
        .populate('items.product', 'name price');

      const total = await Order.countDocuments(query);

      return {
        orders,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      };
    } catch (error) {
      throw new Error(`Siparişler getirilirken hata: ${error.message}`);
    }
  }

  // Sipariş durumunu güncelle
  async updateOrderStatus(orderId, status, userId = null) {
    try {
      const order = await Order.findById(orderId).populate('user', 'email name');

      if (!order) {
        throw new Error('Sipariş bulunamadı');
      }

      // Durum geçişlerini kontrol et
      if (!this.isValidStatusTransition(order.status, status)) {
        throw new Error(`${order.status} durumundan ${status} durumuna geçiş yapılamaz`);
      }

      order.status = status;
      order.statusHistory.push({
        status,
        date: new Date(),
        updatedBy: userId
      });

      // Özel durum işlemleri
      if (status === 'delivered') {
        order.deliveredAt = new Date();
      } else if (status === 'cancelled') {
        // Stokları geri yükle
        await this.restoreProductStocks(order.items);
      }

      await order.save();

      // Email bildirimi
      await emailService.sendOrderStatusUpdate(order);

      return order;
    } catch (error) {
      throw new Error(`Sipariş durumu güncellenirken hata: ${error.message}`);
    }
  }

  // Sipariş iptal et
  async cancelOrder(orderId, userId, reason) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error('Sipariş bulunamadı');
      }

      // Kullanıcı kendi siparişini mi iptal ediyor kontrol et
      if (order.user.toString() !== userId) {
        throw new Error('Bu siparişi iptal etme yetkiniz yok');
      }

      // İptal edilebilir durumda mı kontrol et
      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new Error('Bu sipariş iptal edilemez');
      }

      order.status = 'cancelled';
      order.cancelReason = reason;
      order.cancelledAt = new Date();
      order.statusHistory.push({
        status: 'cancelled',
        date: new Date(),
        updatedBy: userId,
        note: reason
      });

      await order.save();

      // Stokları geri yükle
      await this.restoreProductStocks(order.items);

      // Email bildirimi
      const populatedOrder = await order.populate('user', 'name email');
      await emailService.sendOrderCancellation(populatedOrder);

      return order;
    } catch (error) {
      throw new Error(`Sipariş iptal edilirken hata: ${error.message}`);
    }
  }

  // Sipariş istatistikleri (Admin için)
  async getOrderStats() {
    try {
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      const completedOrders = await Order.countDocuments({ status: 'delivered' });
      const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

      const totalRevenue = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      const todayOrders = await Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      });

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayOrders
      };
    } catch (error) {
      throw new Error(`İstatistikler getirilirken hata: ${error.message}`);
    }
  }

  // Yardımcı metodlar
  async validateAndCalculateOrder(items) {
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        throw new Error(`Ürün bulunamadı: ${item.product}`);
      }

      if (!product.inStock || product.stock < item.quantity) {
        throw new Error(`Yetersiz stok: ${product.name}`);
      }

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        totalPrice: product.price * item.quantity
      });

      totalAmount += product.price * item.quantity;
    }

    return { items: validatedItems, totalAmount };
  }

  async updateProductStocks(items) {
    for (const item of items) {
      await productService.updateStock(item.product, item.quantity, 'decrease');
    }
  }

  async restoreProductStocks(items) {
    for (const item of items) {
      await productService.updateStock(item.product, item.quantity, 'increase');
    }
  }

  async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const count = await Order.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });

    const orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
    return orderNumber;
  }

  isValidStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'returned'],
      'delivered': ['returned'],
      'cancelled': [],
      'returned': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  buildOrderQuery(filters) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.userId) {
      query.user = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    if (filters.orderNumber) {
      query.orderNumber = { $regex: filters.orderNumber, $options: 'i' };
    }

    return query;
  }
}

module.exports = new OrderService();