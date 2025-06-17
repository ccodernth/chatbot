// services/productService.js
const Product = require('../models/productModel');

class ProductService {
  // Tüm ürünleri getir (filtreleme ve sayfalama ile)
  async getAllProducts(filters = {}, page = 1, limit = 10, sort = '-createdAt') {
    try {
      const query = this.buildQuery(filters);
      const skip = (page - 1) * limit;

      const products = await Product.find(query)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .populate('category', 'name');

      const total = await Product.countDocuments(query);

      return {
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      };
    } catch (error) {
      throw new Error(`Ürünler getirilirken hata: ${error.message}`);
    }
  }

  // Tek bir ürünü getir
  async getProductById(productId) {
    try {
      const product = await Product.findById(productId)
        .populate('category', 'name')
        .populate('reviews.user', 'name email');

      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      return product;
    } catch (error) {
      throw new Error(`Ürün getirilirken hata: ${error.message}`);
    }
  }

  // Yeni ürün oluştur
  async createProduct(productData) {
    try {
      const product = new Product(productData);
      await product.save();
      return product;
    } catch (error) {
      throw new Error(`Ürün oluşturulurken hata: ${error.message}`);
    }
  }

  // Ürün güncelle
  async updateProduct(productId, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      return product;
    } catch (error) {
      throw new Error(`Ürün güncellenirken hata: ${error.message}`);
    }
  }

  // Ürün sil
  async deleteProduct(productId) {
    try {
      const product = await Product.findByIdAndDelete(productId);
      
      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      return { message: 'Ürün başarıyla silindi' };
    } catch (error) {
      throw new Error(`Ürün silinirken hata: ${error.message}`);
    }
  }

  // Ürün araması (chatbot için)
  async searchProducts(searchTerm, limit = 10) {
    try {
      const searchQuery = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      };

      const products = await Product.find(searchQuery)
        .limit(limit)
        .select('name price imageUrl description inStock');

      return products;
    } catch (error) {
      throw new Error(`Ürün aramasında hata: ${error.message}`);
    }
  }

  // Kategoriye göre ürünleri getir
  async getProductsByCategory(categoryId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const products = await Product.find({ category: categoryId })
        .sort('-createdAt')
        .limit(limit)
        .skip(skip);

      const total = await Product.countDocuments({ category: categoryId });

      return {
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      };
    } catch (error) {
      throw new Error(`Kategori ürünleri getirilirken hata: ${error.message}`);
    }
  }

  // Stok güncelleme
  async updateStock(productId, quantity, operation = 'decrease') {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      if (operation === 'decrease') {
        if (product.stock < quantity) {
          throw new Error('Yetersiz stok');
        }
        product.stock -= quantity;
      } else {
        product.stock += quantity;
      }

      await product.save();
      return product;
    } catch (error) {
      throw new Error(`Stok güncellenirken hata: ${error.message}`);
    }
  }

  // Popüler ürünleri getir
  async getPopularProducts(limit = 8) {
    try {
      const products = await Product.find({ inStock: true })
        .sort('-soldCount -rating')
        .limit(limit)
        .select('name price imageUrl rating soldCount');

      return products;
    } catch (error) {
      throw new Error(`Popüler ürünler getirilirken hata: ${error.message}`);
    }
  }

  // Yeni ürünleri getir
  async getNewProducts(limit = 8) {
    try {
      const products = await Product.find({ inStock: true })
        .sort('-createdAt')
        .limit(limit)
        .select('name price imageUrl createdAt');

      return products;
    } catch (error) {
      throw new Error(`Yeni ürünler getirilirken hata: ${error.message}`);
    }
  }

  // Benzer ürünleri getir
  async getSimilarProducts(productId, limit = 4) {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      const similarProducts = await Product.find({
        _id: { $ne: productId },
        category: product.category,
        inStock: true
      })
        .limit(limit)
        .select('name price imageUrl');

      return similarProducts;
    } catch (error) {
      throw new Error(`Benzer ürünler getirilirken hata: ${error.message}`);
    }
  }

  // Query builder helper
  buildQuery(filters) {
    const query = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    if (filters.inStock !== undefined) {
      query.inStock = filters.inStock;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    return query;
  }
}

module.exports = new ProductService();