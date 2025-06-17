// app/contexts/AdminContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';

interface DashboardStats {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
  };
  orders: any;
  products: any;
  users: any;
  revenue: any;
  recentOrders: any[];
  topProducts: any[];
}

interface AdminContextType {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  uploadProductImages: (files: File[]) => Promise<any>;
  updateOrderStatus: (orderId: string, status: string) => Promise<any>;
  updateUserRole: (userId: string, role: string) => Promise<any>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.stats);
    } catch (err: any) {
      setError(err.message || 'İstatistikler yüklenirken hata oluştu');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  const uploadProductImages = async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await adminAPI.uploadProductImages(formData);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Resim yükleme hatası');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await adminAPI.updateOrderStatus(orderId, status);
      await refreshStats(); // İstatistikleri güncelle
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Sipariş durumu güncelleme hatası');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await adminAPI.updateUserRole(userId, role);
      await refreshStats(); // İstatistikleri güncelle
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Kullanıcı rolü güncelleme hatası');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const value = {
    stats,
    loading,
    error,
    refreshStats,
    uploadProductImages,
    updateOrderStatus,
    updateUserRole
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};