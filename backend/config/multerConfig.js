// config/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload dizinlerini oluştur
const uploadDirs = {
  products: 'uploads/products',
  users: 'uploads/users',
  temp: 'uploads/temp'
};

// Dizinleri oluştur
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Dosya filtreleme
const imageFileFilter = (req, file, cb) => {
  // Sadece resim dosyalarını kabul et
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Dosya adı oluşturma
const generateFileName = (file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(file.originalname);
  const name = path.basename(file.originalname, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 50);
  
  return `${name}-${uniqueSuffix}${ext}`;
};

// Ürün resimleri için storage
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.products);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file));
  }
});

// Kullanıcı avatarları için storage
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.users);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file));
  }
});

// Geçici dosyalar için storage (sonra işlenecek)
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.temp);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file));
  }
});

// Multer yapılandırmaları
const uploadConfig = {
  product: multer({
    storage: productStorage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 5 // Maksimum 5 resim
    }
  }),
  
  user: multer({
    storage: userStorage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
      files: 1
    }
  }),
  
  temp: multer({
    storage: tempStorage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10
    }
  })
};

// Dosya silme yardımcı fonksiyonu
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Birden fazla dosyayı silme
const deleteFiles = async (filePaths) => {
  const deletePromises = filePaths.map(filePath => deleteFile(filePath));
  await Promise.all(deletePromises);
};

module.exports = {
  uploadConfig,
  uploadDirs,
  deleteFile,
  deleteFiles
};