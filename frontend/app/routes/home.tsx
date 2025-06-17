import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Heart, 
  Search, 
  Filter,
  Star,
  TrendingUp,
  Clock,
  Package
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
  images?: any[];
  inStock: boolean;
  stock: number;
  rating?: number;
  soldCount?: number;
  featured?: boolean;
  tags?: string[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterInStock, setFilterInStock] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [sortBy, filterInStock]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/api/products?limit=12`;
      
      if (sortBy) {
        url += `&sort=${sortBy}`;
      }
      
      if (filterInStock) {
        url += `&inStock=true`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Ürünler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) {
      alert("Bu ürün şu anda stokta yok");
      return;
    }
    
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.mainImage,
      quantity: 1
    });
    
    // Başarı bildirimi (opsiyonel)
    alert(`${product.name} sepete eklendi!`);
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Hoş Geldiniz!
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              En yeni ve en kaliteli ürünleri keşfedin
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
              />
              <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="text-gray-600">Ücretsiz Kargo</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-gray-600">Hızlı Teslimat</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-gray-600">Kaliteli Ürünler</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-gray-600">En Çok Satanlar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Sorting */}
      <section className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterInStock}
                onChange={(e) => setFilterInStock(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Sadece Stokta Olanlar</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Öne Çıkanlar</option>
              <option value="-createdAt">En Yeniler</option>
              <option value="price">Fiyat (Düşükten Yükseğe)</option>
              <option value="-price">Fiyat (Yüksekten Düşüğe)</option>
              <option value="-soldCount">En Çok Satanlar</option>
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Ürün bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const discount = calculateDiscount(product.price, product.comparePrice);
              
              return (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                >
                  {/* Product Image */}
                  <Link to={`/product/${product._id}`} className="block relative overflow-hidden">
                    <img
                      src={product.mainImage || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                        %{discount} İndirim
                      </span>
                    )}
                    {product.featured && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-md text-sm font-semibold">
                        Öne Çıkan
                      </span>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
                          Stokta Yok
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(product.rating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          ({product.soldCount || 0} satış)
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ₺{product.price.toLocaleString('tr-TR')}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₺{product.comparePrice.toLocaleString('tr-TR')}
                          </span>
                        )}
                      </div>
                      {product.stock > 0 && product.stock <= 10 && (
                        <span className="text-xs text-orange-600 font-medium">
                          Son {product.stock} adet!
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                          product.inStock
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Sepete Ekle
                      </button>
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Newsletter Section */}
      <section className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Fırsatları Kaçırmayın!</h2>
          <p className="mb-6 text-gray-300">
            E-posta listemize katılın ve özel indirimlerden ilk siz haberdar olun
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Abone Ol
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}