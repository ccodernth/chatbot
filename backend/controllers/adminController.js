// controllers/adminController.js
const dashboardService = require('../services/dashboardService');
const productService = require('../services/productService');
const orderService = require('../services/orderService');
const userService = require('../services/userService');
const imageService = require('../services/imageService');
const { uploadDirs } = require('../config/multerConfig');
const path = require('path');

// Dashboard istatistikleri
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Satış grafiği verileri
exports.getSalesChart = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const chartData = await dashboardService.getSalesChartData(parseInt(days));
    
    res.json({
      success: true,
      chartData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Kategori dağılımı
exports.getCategoryDistribution = async (req, res) => {
  try {
    const distribution = await dashboardService.getCategorySalesDistribution();
    
    res.json({
      success: true,
      distribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Ürün resmi yükleme
exports.uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resim dosyası gerekli'
      });
    }

    const processedImages = [];

    // Her resmi işle
    for (const file of req.files) {
      const processed = await imageService.processProductImage(
        file.path,
        uploadDirs.products
      );
      
      const urls = imageService.generateResponsiveUrls(processed, 'products');
      
      processedImages.push({
        filename: file.filename,
        originalName: file.originalname,
        urls,
        processedFiles: processed
      });
    }

    res.json({
      success: true,
      message: 'Resimler başarıyla yüklendi',
      images: processedImages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Kullanıcıları yönet
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    
    const filter = {
      search,
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined
    };

    const result = await userService.getAllUsers(
      parseInt(page),
      parseInt(limit),
      filter
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Kullanıcı rolü güncelle
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz rol'
      });
    }

    const user = await userService.updateUserRole(userId, role);

    res.json({
      success: true,
      message: 'Kullanıcı rolü güncellendi',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Sipariş durumu güncelle
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(
      orderId,
      status,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Sipariş durumu güncellendi',
      order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Tüm siparişleri getir
exports.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate,
      orderNumber 
    } = req.query;

    const filters = {
      status,
      startDate,
      endDate,
      orderNumber
    };

    const result = await orderService.getAllOrders(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toplu ürün güncelleme
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ürün ID listesi gerekli'
      });
    }

    const results = await Promise.all(
      productIds.map(id => productService.updateProduct(id, updates))
    );

    res.json({
      success: true,
      message: `${results.length} ürün güncellendi`,
      updatedProducts: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toplu ürün silme
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ürün ID listesi gerekli'
      });
    }

    await Promise.all(
      productIds.map(id => productService.deleteProduct(id))
    );

    res.json({
      success: true,
      message: `${productIds.length} ürün silindi`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Sistem logları (opsiyonel)
exports.getSystemLogs = async (req, res) => {
  try {
    // Bu kısım loglama sistemi eklendiğinde implement edilebilir
    res.json({
      success: true,
      logs: [],
      message: 'Log sistemi henüz aktif değil'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

