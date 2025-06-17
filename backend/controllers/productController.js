// controllers/productController.js
const productService = require('../services/productService');

// Tüm ürünleri getir
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, minPrice, maxPrice, search, sort } = req.query;
    
    const filters = {
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search
    };

    const result = await productService.getAllProducts(
      filters,
      parseInt(page),
      parseInt(limit),
      sort
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

// Tek bir ürünü getir
exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Yeni ürün oluştur (Admin)
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Ürün başarıyla oluşturuldu',
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ürün güncelle (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Ürün başarıyla güncellendi',
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ürün sil (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    
    res.json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ürün ara
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi gerekli'
      });
    }

    const products = await productService.searchProducts(q, parseInt(limit));
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Popüler ürünleri getir
exports.getPopularProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const products = await productService.getPopularProducts(parseInt(limit));
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Yeni ürünleri getir
exports.getNewProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const products = await productService.getNewProducts(parseInt(limit));
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Benzer ürünleri getir
exports.getSimilarProducts = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const products = await productService.getSimilarProducts(
      req.params.id,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};