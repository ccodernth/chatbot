// app/routes/checkout.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  Phone, 
  Mail,
  User,
  ArrowLeft,
  Check,
  AlertCircle,
  Package,
  ShoppingBag
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

interface OrderForm {
  // Shipping Address
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Payment Method
  paymentMethod: 'credit_card' | 'transfer' | 'cash_on_delivery';
  
  // Additional
  notes: string;
  termsAccepted: boolean;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<OrderForm>({
    fullName: user?.name || "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Türkiye",
    paymentMethod: "credit_card",
    notes: "",
    termsAccepted: false
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
    
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [items, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (step: number): boolean => {
    setError("");
    
    switch (step) {
      case 1:
        // Validate shipping info
        if (!formData.fullName || !formData.phone || !formData.email || 
            !formData.address || !formData.city || !formData.state || !formData.zipCode) {
          setError("Lütfen tüm alanları doldurun");
          return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError("Geçerli bir email adresi girin");
          return false;
        }
        
        // Phone validation
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
          setError("Geçerli bir telefon numarası girin");
          return false;
        }
        break;
        
      case 2:
        // Payment method is always selected
        break;
        
      case 3:
        // Terms must be accepted
        if (!formData.termsAccepted) {
          setError("Satış sözleşmesini kabul etmelisiniz");
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitOrder = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    setError("");

    try {
      const orderData = {
        items: items.map(item => ({
          product: item.id,
          quantity: item.quantity
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        totalAmount: finalTotal
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sipariş oluşturulamadı');
      }

      const order = await response.json();
      
      // Clear cart
      clearCart();
      
      // Redirect to success page
      navigate(`/order-success/${order._id}`);
      
    } catch (err: any) {
      setError(err.message || 'Sipariş oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = totalPrice > 150 ? 0 : 15;
  const finalTotal = totalPrice + shippingCost;

  const steps = [
    { number: 1, title: "Teslimat Bilgileri", icon: Truck },
    { number: 2, title: "Ödeme Yöntemi", icon: CreditCard },
    { number: 3, title: "Sipariş Onayı", icon: Check }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Sipariş Tamamla</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-colors
                      ${isActive ? 'bg-blue-600 text-white' : 
                        isCompleted ? 'bg-green-600 text-white' : 
                        'bg-gray-300 text-gray-600'}
                    `}>
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 transition-colors ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <MapPin className="h-6 w-6 mr-2" />
                    Teslimat Bilgileri
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5XX XXX XX XX"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adres *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mahalle, Sokak, Bina No, Daire No"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İl *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="İstanbul"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İlçe *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Kadıköy"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Posta Kodu *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="34000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ülke
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <CreditCard className="h-6 w-6 mr-2" />
                    Ödeme Yöntemi
                  </h2>
                  
                  <div className="space-y-4">
                    <label className="block p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={formData.paymentMethod === 'credit_card'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span className="font-medium">Kredi/Banka Kartı</span>
                      <p className="text-sm text-gray-600 mt-1 ml-6">
                        Güvenli ödeme sayfasına yönlendirileceksiniz
                      </p>
                    </label>
                    
                    <label className="block p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={formData.paymentMethod === 'transfer'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span className="font-medium">Banka Havalesi/EFT</span>
                      <p className="text-sm text-gray-600 mt-1 ml-6">
                        Sipariş sonrası banka bilgileri gönderilecektir
                      </p>
                    </label>
                    
                    <label className="block p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === 'cash_on_delivery'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span className="font-medium">Kapıda Ödeme</span>
                      <p className="text-sm text-gray-600 mt-1 ml-6">
                        Ürün tesliminde nakit veya kart ile ödeme
                      </p>
                    </label>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sipariş Notu (Opsiyonel)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Teslimat veya sipariş ile ilgili notunuz varsa yazabilirsiniz..."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Order Summary */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <Package className="h-6 w-6 mr-2" />
                    Sipariş Özeti
                  </h2>

                  {/* Shipping Address Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium mb-2">Teslimat Adresi</h3>
                    <p className="text-sm text-gray-600">
                      {formData.fullName}<br />
                      {formData.address}<br />
                      {formData.state}, {formData.city} {formData.zipCode}<br />
                      {formData.country}<br />
                      Tel: {formData.phone}<br />
                      E-posta: {formData.email}
                    </p>
                  </div>

                  {/* Payment Method Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium mb-2">Ödeme Yöntemi</h3>
                    <p className="text-sm text-gray-600">
                      {formData.paymentMethod === 'credit_card' && 'Kredi/Banka Kartı'}
                      {formData.paymentMethod === 'transfer' && 'Banka Havalesi/EFT'}
                      {formData.paymentMethod === 'cash_on_delivery' && 'Kapıda Ödeme'}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Sipariş Kalemleri</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.quantity} adet × ₺{item.price.toLocaleString('tr-TR')}
                            </p>
                          </div>
                          <p className="font-medium">
                            ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="border-t pt-6">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleInputChange}
                        className="mt-1 mr-3"
                      />
                      <span className="text-sm text-gray-600">
                        <Link to="/terms" className="text-blue-600 hover:underline">
                          Satış sözleşmesi
                        </Link>
                        {" "}ve{" "}
                        <Link to="/privacy" className="text-blue-600 hover:underline">
                          gizlilik politikası
                        </Link>
                        nı okudum ve kabul ediyorum.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {currentStep > 1 ? (
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Geri
                  </button>
                ) : (
                  <Link
                    to="/cart"
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Sepete Dön
                  </Link>
                )}

                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    İleri
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading || !formData.termsAccepted}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      loading || !formData.termsAccepted
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? 'İşleniyor...' : 'Siparişi Tamamla'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Sipariş Özeti
              </h3>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} ({item.quantity}x)
                    </span>
                    <span className="font-medium">
                      ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span>₺{totalPrice.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Ücretsiz</span>
                    ) : (
                      `₺${shippingCost.toLocaleString('tr-TR')}`
                    )}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Toplam</span>
                    <span>₺{finalTotal.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-600 text-center mb-3">
                  Güvenli Alışveriş
                </p>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <div className="bg-gray-100 p-2 rounded-lg inline-block">
                      <CreditCard className="h-6 w-6 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">256-bit SSL</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-100 p-2 rounded-lg inline-block">
                      <Check className="h-6 w-6 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Güvenli Ödeme</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}