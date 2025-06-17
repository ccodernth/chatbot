// app/components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  RefreshCw
} from 'lucide-react';
import { Link } from '@remix-run/react';
import { adminAPI } from '../services/adminAPI';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

export default function AdminDashboard() {
  const { stats, loading, error, refreshStats } = useAdmin();
  const [chartData, setChartData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const response = await adminAPI.getSalesChart(30);
      setChartData(response.data.chartData);
    } catch (err) {
      console.error('Chart data error:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStats();
    await fetchChartData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      title: 'Toplam Gelir',
      value: `₺${stats?.overview.totalRevenue.toLocaleString('tr-TR') || 0}`,
      icon: <DollarSign className="h-6 w-6" />,
      trend: stats?.revenue.growthRate,
      color: 'bg-green-500'
    },
    {
      title: 'Toplam Sipariş',
      value: stats?.overview.totalOrders || 0,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Toplam Ürün',
      value: stats?.overview.totalProducts || 0,
      icon: <Package className="h-6 w-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats?.overview.totalUsers || 0,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                {stat.trend && (
                  <p className={`text-sm mt-2 flex items-center ${
                    stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stat.trend > 0 ? '+' : ''}{stat.trend}%
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sipariş Durumları</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bekleyen</span>
              <span className="font-semibold text-yellow-600">
                {stats?.orders.pending || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">İşleniyor</span>
              <span className="font-semibold text-blue-600">
                {stats?.orders.processing || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tamamlandı</span>
              <span className="font-semibold text-green-600">
                {stats?.orders.completed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Tamamlanma Oranı</span>
              <span className="font-semibold">%{stats?.orders.completionRate || 0}</span>
            </div>
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Ürün Durumu</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Aktif Ürünler</span>
              <span className="font-semibold text-green-600">
                {stats?.products.active || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stokta Yok</span>
              <span className="font-semibold text-red-600">
                {stats?.products.outOfStock || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Düşük Stok</span>
              <span className="font-semibold text-yellow-600">
                {stats?.products.lowStock || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Aktif Oran</span>
              <span className="font-semibold">%{stats?.products.activeRate || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Son Siparişler</h2>
              <Link to="/admin/orders" className="text-blue-600 text-sm hover:underline">
                Tümünü Gör
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.recentOrders.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₺{order.totalAmount.toLocaleString('tr-TR')}</p>
                    <p className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">En Çok Satan Ürünler</h2>
              <Link to="/admin/products" className="text-blue-600 text-sm hover:underline">
                Tümünü Gör
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.topProducts.map((item: any) => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name}
                      className="w-10 h-10 rounded object-cover mr-3"
                    />
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        ₺{item.product.price.toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.totalQuantity} adet</p>
                    <p className="text-sm text-gray-600">
                      ₺{item.totalRevenue.toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}