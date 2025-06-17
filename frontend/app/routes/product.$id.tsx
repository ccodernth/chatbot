// app/routes/product.$id.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RefreshCw,
  Star,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  X
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  mainImage: string;
  images?: Array<{
    original: string;
    large: string;
    medium: string;
    small: string;
    thumbnail: string;
  }>;
  inStock: boolean;
  stock: number;
  rating?: number;
  soldCount?: number;
  featured?: boolean;
  tags?: string[];
  attributes?: Array<{ name: string; value: string }>;
  sku?: string;
}

interface SimilarProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchSimilarProducts();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Ürün bulunamadı');
      const data = await res.json();
      setProduct(data.product || data);
    } catch (error) {
      console.error('Ürün yüklenemedi:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const res = await fetch(`/api/products/${id}/similar`);
      const data = await res.json();
      setSimilarProducts(data.products || []);
    } catch (error) {
      console.error('Benzer ürünler yüklenemedi:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.mainImage,
      quantity
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const calculateDiscount = () => {
    if (!product?.comparePrice || product.comparePrice <= product.price) return 0;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const allImages = product ? [
    { thumbnail: product.mainImage, original: product.mainImage },
    ...(product.images || [])
  ] : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ürün bulunamadı</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              Ana Sayfa
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={allImages[selectedImage]?.original || product.mainImage}
                  alt={product.name}
                  className="w-full h-96 lg:h-[500px] object-contain"
                />
                
                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % allImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                    %{discount} İndirim
                  </span>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img.thumbnail}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating and Sales */}
              {(product.rating || product.soldCount) && (
                <div className="flex items-center gap-4 mb-4">
                  {product.rating && (
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600">({product.rating})</span>
                    </div>
                  )}
                  {product.soldCount && (
                    <span className="text-gray-600">{product.soldCount} satış</span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ₺{product.price.toLocaleString('tr-TR')}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">
                      ₺{product.comparePrice.toLocaleString('tr-TR')}
                    </span>
                  )}
                </div>
                {product.sku && (
                  <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Stokta</span>
                    {product.stock <= 10 && (
                      <span className="text-orange-600 ml-2">
                        (Son {product.stock} adet!)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <X className="h-5 w-5" />
                    <span className="font-medium">Stokta Yok</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {product.inStock && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adet
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                        className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {isInCart(product._id) && (
                      <span className="text-sm text-gray-600">
                        Sepetinizde {getItemQuantity(product._id)} adet var
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
                    product.inStock
                      ? addedToCart
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Sepete Eklendi!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Sepete Ekle
                    </>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    product.inStock
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Hemen Al
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                  {/* Share menu implementation can be added here */}
                </div>
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Hızlı ve Güvenli Kargo</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Güvenli Ödeme</span>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">14 Gün İçinde İade Garantisi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description and Details */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Description */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ürün Açıklaması</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Etiketler</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Ürün Özellikleri</h3>
                  <dl className="space-y-3">
                    {product.attributes.map((attr, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-gray-600">{attr.name}:</dt>
                        <dd className="text-gray-900 font-medium">{attr.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Benzer Ürünler</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarProducts.map((item) => (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    className="group"
                  >
                    <div className="bg-gray-100 rounded-lg overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ₺{item.price.toLocaleString('tr-TR')}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}