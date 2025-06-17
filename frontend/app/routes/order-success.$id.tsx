// app/routes/order-success.$id.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Phone,
  ArrowRight,
  Home,
  FileText,
  Clock
} from "lucide-react";

interface OrderDetails {
  _id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
  };
  paymentMethod: string;
  items: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
    totalPrice: number;
  }>;
}

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Sipariş detayları alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      'credit_card': 'Kredi/Banka Kartı',
      'transfer': 'Banka Havalesi/EFT',
      'cash_on_delivery': 'Kapıda Ödeme'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Siparişiniz Alındı!
          </h1>
          <p className="text-xl text-gray-600">
            Siparişiniz başarıyla oluşturuldu ve hazırlanmaya başlandı.
          </p>
        </div>

        {/* Order Info Card */}
        {order && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Sipariş No: {order.orderNumber}</h2>
                  <p className="text-green-100">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-100">Toplam Tutar</p>
                  <p className="text-3xl font-bold">₺{order.totalAmount.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Sonraki Adımlar
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">1.</span>
                    E-posta adresinize sipariş onayı gönderdik.
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">2.</span>
                    Siparişiniz hazırlandığında bilgilendirileceksiniz.
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">3.</span>
                    Kargo takip numarası SMS ve e-posta ile gönderilecek.
                  </li>
                </ul>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Teslimat Adresi
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.state}, {order.shippingAddress.city} {order.shippingAddress.zipCode}</p>
                    <div className="mt-3 space-y-1">
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {order.shippingAddress.phone}
                      </p>
                      <p className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {order.shippingAddress.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Ödeme Bilgileri
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                    <p className="font-medium text-gray-900">{getPaymentMethodText(order.paymentMethod)}</p>
                    
                    {order.paymentMethod === 'transfer' && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded text-sm text-yellow-800">
                        Banka hesap bilgileri e-posta adresinize gönderildi.
                      </div>
                    )}
                    
                    {order.paymentMethod === 'cash_on_delivery' && (
                      <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
                        Ödemeyi ürün tesliminde yapabilirsiniz.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Sipariş Kalemleri
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ürün</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Adet</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Fiyat</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{item.product.name}</td>
                          <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            ₺{item.product.price.toLocaleString('tr-TR')}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            ₺{item.totalPrice.toLocaleString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                          Genel Toplam:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-lg">
                          ₺{order.totalAmount.toLocaleString('tr-TR')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 mr-2" />
            Siparişlerim
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">Sorularınız mı var?</p>
          <p className="text-sm text-gray-500">
            Bize{" "}
            <a href="mailto:destek@example.com" className="text-blue-600 hover:underline">
              destek@example.com
            </a>
            {" "}adresinden veya{" "}
            <a href="tel:+902123456789" className="text-blue-600 hover:underline">
              0212 345 67 89
            </a>
            {" "}numarasından ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}