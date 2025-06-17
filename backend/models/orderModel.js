// models/orderModel.js
const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Miktar en az 1 olmalı']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Fiyat negatif olamaz']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Toplam fiyat negatif olamaz']
    }
  },
  {
    _id: false,
  }
);

const shippingAddressSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Ad soyad zorunlu']
    },
    phone: {
      type: String,
      required: [true, 'Telefon numarası zorunlu']
    },
    email: {
      type: String,
      required: [true, 'Email zorunlu']
    },
    address: {
      type: String,
      required: [true, 'Adres zorunlu']
    },
    city: {
      type: String,
      required: [true, 'İl zorunlu']
    },
    state: {
      type: String,
      required: [true, 'İlçe zorunlu']
    },
    zipCode: {
      type: String,
      required: [true, 'Posta kodu zorunlu']
    },
    country: {
      type: String,
      default: 'Türkiye'
    }
  },
  {
    _id: false
  }
);

const statusHistorySchema = mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    _id: false
  }
);

const orderSchema = mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      required: [true, 'Ödeme yöntemi zorunlu'],
      enum: ['credit_card', 'transfer', 'cash_on_delivery']
    },
    paymentDetails: {
      transactionId: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
      },
      paidAt: Date
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Toplam tutar negatif olamaz']
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, 'Kargo ücreti negatif olamaz']
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    statusHistory: [statusHistorySchema],
    trackingNumber: String,
    notes: String,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String
  },
  {
    timestamps: true,
  }
);

// Sipariş numarası oluşturma middleware'i
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });

    this.orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Status history'ye ilk kaydı ekle
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      date: new Date()
    });
  }
  
  next();
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // Days
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;