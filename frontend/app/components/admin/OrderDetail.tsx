// app/components/admin/OrderDetail.tsx
import React from 'react';
import { X, User, MapPin, CreditCard, Package } from 'lucide-react';

interface OrderDetailProps {
  order: any;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

const statusLabels = {
  pending: 'Bekliyor',
  confirmed: 'Onaylandı',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi'
};

export default function OrderDetail({ order, onClose, onStatusUpdate }: OrderDetailProps) {
  const getNextStatuses = (currentStatus: string) => {
    const statusFlow: { [key: string]: string[] } = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };

    return statusFlow[currentStatus] || [];
  };

  const nextStatuses = getNextStatuses(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Sipariş Detayı</h2>
            <p className="text-sm text-gray-600">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Actions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Mevcut Durum</p>
                <span className={`px-3 py-1 text-sm rounded-full ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
              
              {nextStatuses.length > 0 && (
                <div className="flex gap-2">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => onStatusUpdate(order._id, status)}
                      className={`px-4 py-2 text-sm rounded-lg ${
                        status === 'cancelled'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {statusLabels[status]} Olarak İşaretle
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <User className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-medium">Müşteri Bilgileri</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Ad:</span> {order.user.name}</p>
                <p><span className="text-gray-600">Email:</span> {order.user.email}</p>
                <p><span className="text-gray-600">Telefon:</span> {order.user.phone || 'Belirtilmemiş'}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <MapPin className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-medium">Teslimat Adresi</h3>
              </div>
              <div className="text-sm">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-medium">Ödeme Bilgileri</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Yöntem:</span> {order.paymentMethod}</p>
                <p><span className="text-gray-600">Durum:</span> <span className="text-green-600">Ödendi</span></p>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Package className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-medium">Sipariş Bilgileri</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Tarih:</span> {new Date(order.createdAt).toLocaleString('tr-TR')}</p>
                <p><span className="text-gray-600">Toplam:</span> ₺{order.totalAmount.toLocaleString('tr-TR')}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-medium mb-4">Sipariş Kalemleri</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ürün</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Adet</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Birim Fiyat</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                          <span className="text-sm">{item.product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        ₺{item.price.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        ₺{item.totalPrice.toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-medium">
                      Toplam:
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      ₺{order.totalAmount.toLocaleString('tr-TR')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="font-medium mb-2">Sipariş Notları</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}