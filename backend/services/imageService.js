// services/imageService.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { deleteFile } = require('../config/multerConfig');

class ImageService {
  // Resim boyutlandırma ve optimize etme
  async processProductImage(inputPath, outputDir) {
    try {
      const filename = path.basename(inputPath);
      const nameWithoutExt = path.parse(filename).name;
      
      // Farklı boyutlar için ayarlar
      const sizes = {
        thumbnail: { width: 150, height: 150 },
        small: { width: 300, height: 300 },
        medium: { width: 600, height: 600 },
        large: { width: 1200, height: 1200 }
      };

      const processedImages = {};

      // Her boyut için resmi işle
      for (const [sizeName, dimensions] of Object.entries(sizes)) {
        const outputFilename = `${nameWithoutExt}-${sizeName}.webp`;
        const outputPath = path.join(outputDir, outputFilename);

        await sharp(inputPath)
          .resize(dimensions.width, dimensions.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toFile(outputPath);

        processedImages[sizeName] = outputFilename;
      }

      // Orijinal dosyayı da sakla (optimize edilmiş)
      const originalFilename = `${nameWithoutExt}-original.webp`;
      const originalPath = path.join(outputDir, originalFilename);
      
      await sharp(inputPath)
        .webp({ quality: 90 })
        .toFile(originalPath);

      processedImages.original = originalFilename;

      // Geçici dosyayı sil
      if (inputPath.includes('temp')) {
        await deleteFile(inputPath);
      }

      return processedImages;
    } catch (error) {
      throw new Error(`Resim işlenirken hata: ${error.message}`);
    }
  }

  // Kullanıcı avatarı işleme
  async processUserAvatar(inputPath, outputDir) {
    try {
      const filename = path.basename(inputPath);
      const nameWithoutExt = path.parse(filename).name;
      const outputFilename = `${nameWithoutExt}-avatar.webp`;
      const outputPath = path.join(outputDir, outputFilename);

      await sharp(inputPath)
        .resize(200, 200, {
          fit: 'cover',
          position: 'centre'
        })
        .webp({ quality: 85 })
        .toFile(outputPath);

      // Geçici dosyayı sil
      if (inputPath.includes('temp')) {
        await deleteFile(inputPath);
      }

      return outputFilename;
    } catch (error) {
      throw new Error(`Avatar işlenirken hata: ${error.message}`);
    }
  }

  // Base64 resmi dosyaya dönüştürme
  async saveBase64Image(base64Data, outputPath) {
    try {
      // Base64 prefix'ini kaldır
      const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Image, 'base64');

      // Sharp ile optimize et ve kaydet
      await sharp(buffer)
        .webp({ quality: 85 })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      throw new Error(`Base64 resim kaydedilirken hata: ${error.message}`);
    }
  }

  // Resim bilgilerini al
  async getImageMetadata(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        density: metadata.density
      };
    } catch (error) {
      throw new Error(`Resim bilgileri alınırken hata: ${error.message}`);
    }
  }

  // Resim validasyonu
  async validateImage(imagePath, options = {}) {
    try {
      const {
        maxWidth = 4000,
        maxHeight = 4000,
        minWidth = 100,
        minHeight = 100,
        maxFileSize = 10 * 1024 * 1024 // 10MB
      } = options;

      const metadata = await this.getImageMetadata(imagePath);
      const stats = await fs.stat(imagePath);

      const errors = [];

      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        errors.push(`Resim boyutu çok büyük (maksimum ${maxWidth}x${maxHeight})`);
      }

      if (metadata.width < minWidth || metadata.height < minHeight) {
        errors.push(`Resim boyutu çok küçük (minimum ${minWidth}x${minHeight})`);
      }

      if (stats.size > maxFileSize) {
        errors.push(`Dosya boyutu çok büyük (maksimum ${maxFileSize / 1024 / 1024}MB)`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        metadata
      };
    } catch (error) {
      throw new Error(`Resim validasyonu sırasında hata: ${error.message}`);
    }
  }

  // Toplu resim işleme
  async processBulkImages(imagePaths, processFunction) {
    try {
      const results = await Promise.all(
        imagePaths.map(path => processFunction(path))
      );

      return results;
    } catch (error) {
      throw new Error(`Toplu resim işleme hatası: ${error.message}`);
    }
  }

  // Resim URL'si oluşturma
  generateImageUrl(filename, type = 'products') {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${type}/${filename}`;
  }

  // Responsive resim URL'leri oluşturma
  generateResponsiveUrls(imageSet, type = 'products') {
    const urls = {};
    
    for (const [size, filename] of Object.entries(imageSet)) {
      urls[size] = this.generateImageUrl(filename, type);
    }

    return urls;
  }
}

module.exports = new ImageService();