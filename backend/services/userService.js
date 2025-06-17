// services/userService.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService {
  // Kullanıcı oluştur
  async createUser(userData) {
    try {
      // Email kontrolü
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('Bu email adresi zaten kullanılıyor');
      }

      // Şifre hashleme
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();

      // Hassas bilgileri çıkar
      const userObject = user.toObject();
      delete userObject.password;

      return userObject;
    } catch (error) {
      throw new Error(`Kullanıcı oluşturulurken hata: ${error.message}`);
    }
  }

  // Kullanıcı girişi
  async loginUser(email, password) {
    try {
      // Kullanıcıyı bul
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw new Error('Geçersiz email veya şifre');
      }

      // Şifre kontrolü
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Geçersiz email veya şifre');
      }

      // Token oluştur
      const token = this.generateToken(user._id);

      // Son giriş tarihini güncelle
      user.lastLogin = new Date();
      await user.save();

      // Hassas bilgileri çıkar
      const userObject = user.toObject();
      delete userObject.password;

      return {
        user: userObject,
        token
      };
    } catch (error) {
      throw new Error(`Giriş yapılırken hata: ${error.message}`);
    }
  }

  // Kullanıcı profili getir
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId)
        .select('-password')
        .populate('orders', 'orderNumber totalAmount status createdAt');

      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      return user;
    } catch (error) {
      throw new Error(`Profil getirilirken hata: ${error.message}`);
    }
  }

  // Kullanıcı profili güncelle
  async updateUserProfile(userId, updateData) {
    try {
      // Email değişiyorsa kontrol et
      if (updateData.email) {
        const existingUser = await User.findOne({ 
          email: updateData.email,
          _id: { $ne: userId }
        });
        
        if (existingUser) {
          throw new Error('Bu email adresi zaten kullanılıyor');
        }
      }

      // Şifre güncelleniyorsa hashle
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      return user;
    } catch (error) {
      throw new Error(`Profil güncellenirken hata: ${error.message}`);
    }
  }

  // Şifre değiştir
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      // Eski şifre kontrolü
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      
      if (!isOldPasswordValid) {
        throw new Error('Mevcut şifre yanlış');
      }

      // Yeni şifreyi hashle ve kaydet
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return { message: 'Şifre başarıyla değiştirildi' };
    } catch (error) {
      throw new Error(`Şifre değiştirirken hata: ${error.message}`);
    }
  }

  // Adres ekle
  async addAddress(userId, addressData) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      user.addresses.push(addressData);
      await user.save();

      return user.addresses[user.addresses.length - 1];
    } catch (error) {
      throw new Error(`Adres eklenirken hata: ${error.message}`);
    }
  }

  // Adres güncelle
  async updateAddress(userId, addressId, addressData) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex === -1) {
        throw new Error('Adres bulunamadı');
      }

      user.addresses[addressIndex] = {
        ...user.addresses[addressIndex].toObject(),
        ...addressData
      };

      await user.save();

      return user.addresses[addressIndex];
    } catch (error) {
      throw new Error(`Adres güncellenirken hata: ${error.message}`);
    }
  }

  // Adres sil
  async deleteAddress(userId, addressId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      user.addresses = user.addresses.filter(
        addr => addr._id.toString() !== addressId
      );

      await user.save();

      return { message: 'Adres başarıyla silindi' };
    } catch (error) {
      throw new Error(`Adres silinirken hata: ${error.message}`);
    }
  }

  // Tüm kullanıcıları getir (Admin için)
  async getAllUsers(page = 1, limit = 10, filter = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = this.buildUserQuery(filter);

      const users = await User.find(query)
        .select('-password')
        .sort('-createdAt')
        .limit(limit)
        .skip(skip);

      const total = await User.countDocuments(query);

      return {
        users,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      };
    } catch (error) {
      throw new Error(`Kullanıcılar getirilirken hata: ${error.message}`);
    }
  }

  // Kullanıcı rolü güncelle (Admin için)
  async updateUserRole(userId, role) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-password');

      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      return user;
    } catch (error) {
      throw new Error(`Rol güncellenirken hata: ${error.message}`);
    }
  }

  // Kullanıcı istatistikleri (Admin için)
  async getUserStats() {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const newUsersThisMonth = await User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setDate(1))
        }
      });

      return {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        inactiveUsers: totalUsers - activeUsers
      };
    } catch (error) {
      throw new Error(`İstatistikler getirilirken hata: ${error.message}`);
    }
  }

  // Token oluştur
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Query builder helper
  buildUserQuery(filter) {
    const query = {};

    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive;
    }

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } }
      ];
    }

    return query;
  }
}

module.exports = new UserService();