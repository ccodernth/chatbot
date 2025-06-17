// models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ürün adı zorunludur'],
    trim: true,
    maxlength: [100, 'Ürün adı en fazla 100 karakter olabilir']
  },
  description: {
    type: String,
    required: [true, 'Ürün açıklaması zorunludur'],
    maxlength: [2000, 'Açıklama en fazla 2000 karakter olabilir']
  },
  price: {
    type: Number,
    required: [true, 'Fiyat zorunludur'],
    min: [0, 'Fiyat 0\'dan küçük olamaz']
  },
  comparePrice: {
    type: Number,
    min: [0, 'İndirimli fiyat 0\'dan küçük olamaz']
  },
  cost: {
    type: Number,
    min: [0, 'Maliyet 0\'dan küçük olamaz']
  },
  images: [{
    original: String,
    large: String,
    medium: String,
    small: String,
    thumbnail: String,
    alt: String
  }],
  mainImage: {
    type: String,
    required: [true, 'Ana ürün resmi zorunludur']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false // Şimdilik opsiyonel
  },
  tags: [{
    type: String,
    trim: true
  }],
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stok negatif olamaz']
  },
  inStock: {
    type: Boolean,
    default: function() {
      return this.stock > 0;
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'm', 'in', 'ft'],
      default: 'cm'
    }
  },
  attributes: [{
    name: String,
    value: String
  }],
  variants: [{
    name: String,
    options: [String]
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  soldCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Stok kontrolü
productSchema.pre('save', function(next) {
  this.inStock = this.stock > 0;
  next();
});

// Ürün URL slug oluşturma (opsiyonel)
productSchema.virtual('slug').get(function() {
  return this.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
});

module.exports = mongoose.model('Product', productSchema);