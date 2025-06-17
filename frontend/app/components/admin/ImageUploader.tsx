// app/components/admin/ImageUploader.tsx
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { adminAPI } from '../../services/adminAPI';

interface ImageUploaderProps {
  onImagesUploaded: (images: any[]) => void;
  existingImages?: any[];
  maxImages?: number;
}

export default function ImageUploader({ 
  onImagesUploaded, 
  existingImages = [],
  maxImages = 5 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<any[]>(existingImages);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (remainingSlots <= 0) {
      alert(`Maksimum ${maxImages} resim yükleyebilirsiniz`);
      return;
    }

    const filesToUpload = fileArray.slice(0, remainingSlots);
    
    // Validate file types
    const validFiles = filesToUpload.filter(file => 
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
    );

    if (validFiles.length !== filesToUpload.length) {
      alert('Sadece resim dosyaları (JPEG, PNG, GIF, WebP) yükleyebilirsiniz');
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const response = await adminAPI.uploadProductImages(validFiles);
      const newImages = [...images, ...response.images];
      setImages(newImages);
      onImagesUploaded(newImages);
    } catch (error: any) {
      alert(error.message || 'Resim yükleme hatası');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Resim yüklemek için tıklayın</span> veya sürükleyip bırakın
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF, WebP (Maks. 5MB)
          </p>
          {images.length > 0 && (
            <p className="text-xs text-gray-500">
              {images.length}/{maxImages} resim yüklendi
            </p>
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Yükleniyor...</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.urls?.thumbnail || image.thumbnail || image}
                  alt={`Ürün resmi ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Primary Image Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Ana Resim
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <div className="text-sm text-gray-500">
        <p>• İlk resim ana ürün resmi olarak kullanılacaktır</p>
        <p>• En fazla {maxImages} resim yükleyebilirsiniz</p>
        <p>• Önerilen boyut: 800x800 piksel</p>
      </div>
    </div>
  );
}
