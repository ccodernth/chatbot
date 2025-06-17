// services/emailService.js
const nodemailer = require('nodemailer');
const path = require('path');

class EmailService {
  constructor() {
    // Email transporter yapılandırması
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email gönderici bilgileri
    this.from = {
      name: process.env.EMAIL_FROM_NAME || 'E-Ticaret Mağazası',
      email: process.env.EMAIL_USER || 'noreply@example.com'
    };
  }

  // Base email template
  getEmailTemplate(content) {
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header {
            background-color: #2563eb;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .order-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .order-item {
            border-bottom: 1px solid #e9ecef;
            padding: 10px 0;
          }
          .order-item:last-child {
            border-bottom: none;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.from.name}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
            <p>&copy; ${new Date().getFullYear()} ${this.from.name}. Tüm hakları saklıdır.</p>
            <p>
              <a href="${process.env.CLIENT_URL}/unsubscribe" style="color: #6c757d;">Email tercihlerini güncelle</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Hoş geldin emaili
  async sendWelcomeEmail(user) {
    try {
      const content = `
        <h2>Hoş Geldiniz, ${user.name}!</h2>
        <p>Aramıza katıldığınız için çok mutluyuz. ${this.from.name} ailesi olarak size en iyi alışveriş deneyimini sunmak için buradayız.</p>
        
        <h3>Başlangıç için birkaç öneri:</h3>
        <ul>
          <li>Profilinizi tamamlayın ve adres bilgilerinizi ekleyin</li>
          <li>İlgilendiğiniz kategorileri keşfedin</li>
          <li>İlk siparişinizde %10 indirim kazanın!</li>
        </ul>
        
        <center>
          <a href="${process.env.CLIENT_URL}/profile" class="button">Profilimi Görüntüle</a>
        </center>
        
        <p>Herhangi bir sorunuz olursa, bizimle iletişime geçmekten çekinmeyin.</p>
        <p>İyi alışverişler dileriz!</p>
      `;

      const mailOptions = {
        from: `"${this.from.name}" <${this.from.email}>`,
        to: user.email,
        subject: `Hoş Geldiniz ${user.name}! 🎉`,
        html: this.getEmailTemplate(content)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Hoş geldin emaili gönderildi: ${user.email}`);
    } catch (error) {
      console.error('Hoş geldin emaili gönderme hatası:', error);
      throw error;
    }
  }

  // Sipariş onay emaili
  async sendOrderConfirmation(order) {
    try {
      const orderItemsHtml = order.items.map(item => `
        <div class="order-item">
          <strong>${item.product.name}</strong><br>
          ${item.quantity} adet x ₺${item.price.toLocaleString('tr-TR')} = ₺${item.totalPrice.toLocaleString('tr-TR')}
        </div>
      `).join('');

      const paymentMethodText = {
        'credit_card': 'Kredi/Banka Kartı',
        'transfer': 'Banka Havalesi/EFT',
        'cash_on_delivery': 'Kapıda Ödeme'
      };

      const content = `
        <h2>Siparişiniz Alındı! 🛍️</h2>
        <p>Merhaba ${order.shippingAddress.fullName},</p>
        <p>Siparişinizi aldık ve hazırlık sürecine başladık. Sipariş detaylarınız aşağıda:</p>
        
        <div class="order-details">
          <h3>Sipariş No: ${order.orderNumber}</h3>
          <p>Sipariş Tarihi: ${new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
          
          <h4>Ürünler:</h4>
          ${orderItemsHtml}
          
          <div class="total">
            Toplam Tutar: ₺${order.totalAmount.toLocaleString('tr-TR')}
          </div>
        </div>
        
        <h3>Teslimat Adresi:</h3>
        <p>
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.state}, ${order.shippingAddress.city} ${order.shippingAddress.zipCode}<br>
          Tel: ${order.shippingAddress.phone}
        </p>
        
        <h3>Ödeme Yöntemi:</h3>
        <p>${paymentMethodText[order.paymentMethod] || order.paymentMethod}</p>
        
        ${order.paymentMethod === 'transfer' ? `
          <div class="order-details">
            <h4>Banka Hesap Bilgileri:</h4>
            <p>
              <strong>Banka:</strong> Örnek Bank<br>
              <strong>Şube:</strong> 1234<br>
              <strong>Hesap No:</strong> 123456789<br>
              <strong>IBAN:</strong> TR12 3456 7890 1234 5678 9012 34<br>
              <strong>Alıcı:</strong> ${this.from.name}
            </p>
            <p style="color: #dc3545;">Lütfen havale açıklamasına sipariş numaranızı (${order.orderNumber}) yazmayı unutmayın.</p>
          </div>
        ` : ''}
        
        <center>
          <a href="${process.env.CLIENT_URL}/orders/${order._id}" class="button">Siparişimi Takip Et</a>
        </center>
        
        <p>Siparişinizle ilgili tüm gelişmelerden sizi haberdar edeceğiz.</p>
      `;

      const mailOptions = {
        from: `"${this.from.name}" <${this.from.email}>`,
        to: order.shippingAddress.email,
        subject: `Sipariş Onayı - ${order.orderNumber}`,
        html: this.getEmailTemplate(content)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Sipariş onay emaili gönderildi: ${order.shippingAddress.email}`);
    } catch (error) {
      console.error('Sipariş onay emaili gönderme hatası:', error);
      throw error;
    }
  }

  // Sipariş durum güncelleme emaili
  async sendOrderStatusUpdate(order) {
    try {
      const statusMessages = {
        'confirmed': {
          title: 'Siparişiniz Onaylandı ✅',
          message: 'Siparişiniz başarıyla onaylandı ve hazırlanmaya başlandı.'
        },
        'processing': {
          title: 'Siparişiniz Hazırlanıyor 📦',
          message: 'Siparişiniz özenle paketleniyor.'
        },
        'shipped': {
          title: 'Siparişiniz Kargoya Verildi 🚚',
          message: `Siparişiniz kargoya teslim edildi. Kargo takip numaranız: ${order.trackingNumber || 'Henüz atanmadı'}`
        },
        'delivered': {
          title: 'Siparişiniz Teslim Edildi 🎉',
          message: 'Siparişiniz başarıyla teslim edildi. Bizi tercih ettiğiniz için teşekkür ederiz!'
        },
        'cancelled': {
          title: 'Siparişiniz İptal Edildi ❌',
          message: `Siparişiniz iptal edildi. ${order.cancelReason ? `Sebep: ${order.cancelReason}` : ''}`
        }
      };

      const statusInfo = statusMessages[order.status];
      if (!statusInfo) return;

      const content = `
        <h2>${statusInfo.title}</h2>
        <p>Merhaba ${order.user.name},</p>
        <p>${statusInfo.message}</p>
        
        <div class="order-details">
          <h3>Sipariş Bilgileri:</h3>
          <p>
            <strong>Sipariş No:</strong> ${order.orderNumber}<br>
            <strong>Durum:</strong> ${statusInfo.title}<br>
            <strong>Güncelleme Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
        
        ${order.trackingNumber && order.status === 'shipped' ? `
          <p>Kargonuzu takip etmek için aşağıdaki butona tıklayabilirsiniz:</p>
          <center>
            <a href="https://gonderitakip.ptt.gov.tr/Track/Verify?q=${order.trackingNumber}" class="button">Kargo Takibi</a>
          </center>
        ` : ''}
        
        <center>
          <a href="${process.env.CLIENT_URL}/orders/${order._id}" class="button">Sipariş Detayları</a>
        </center>
      `;

      const mailOptions = {
        from: `"${this.from.name}" <${this.from.email}>`,
        to: order.user.email,
        subject: `Sipariş Durumu Güncellendi - ${order.orderNumber}`,
        html: this.getEmailTemplate(content)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Durum güncelleme emaili gönderildi: ${order.user.email}`);
    } catch (error) {
      console.error('Durum güncelleme emaili gönderme hatası:', error);
      throw error;
    }
  }

  // Sipariş iptali emaili
  async sendOrderCancellation(order) {
    try {
      const content = `
        <h2>Siparişiniz İptal Edildi</h2>
        <p>Merhaba ${order.user.name},</p>
        <p>Siparişiniz başarıyla iptal edildi.</p>
        
        <div class="order-details">
          <h3>İptal Edilen Sipariş:</h3>
          <p>
            <strong>Sipariş No:</strong> ${order.orderNumber}<br>
            <strong>İptal Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}<br>
            ${order.cancelReason ? `<strong>İptal Sebebi:</strong> ${order.cancelReason}<br>` : ''}
            <strong>Tutar:</strong> ₺${order.totalAmount.toLocaleString('tr-TR')}
          </p>
        </div>
        
        ${order.paymentDetails?.status === 'completed' ? `
          <p style="color: #28a745;">Ödemeniz 3-5 iş günü içinde iade edilecektir.</p>
        ` : ''}
        
        <p>Başka bir ürünle ilgileniyorsanız, mağazamızı ziyaret edebilirsiniz:</p>
        
        <center>
          <a href="${process.env.CLIENT_URL}" class="button">Alışverişe Devam Et</a>
        </center>
      `;

      const mailOptions = {
        from: `"${this.from.name}" <${this.from.email}>`,
        to: order.user.email,
        subject: `Sipariş İptali - ${order.orderNumber}`,
        html: this.getEmailTemplate(content)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`İptal emaili gönderildi: ${order.user.email}`);
    } catch (error) {
      console.error('İptal emaili gönderme hatası:', error);
      throw error;
    }
  }

  // Şifre sıfırlama emaili
  async sendPasswordReset(user, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      
      const content = `
        <h2>Şifre Sıfırlama Talebi</h2>
        <p>Merhaba ${user.name},</p>
        <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
        
        <center>
          <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
        </center>
        
        <p>Bu link 1 saat süreyle geçerlidir.</p>
        <p>Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
        
        <p style="color: #6c757d; font-size: 12px;">
          Buton çalışmazsa, aşağıdaki linki tarayıcınıza kopyalayın:<br>
          ${resetUrl}
        </p>
      `;

      const mailOptions = {
        from: `"${this.from.name}" <${this.from.email}>`,
        to: user.email,
        subject: 'Şifre Sıfırlama Talebi',
        html: this.getEmailTemplate(content)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Şifre sıfırlama emaili gönderildi: ${user.email}`);
    } catch (error) {
      console.error('Şifre sıfırlama emaili gönderme hatası:', error);
      throw error;
    }
  }

  // Newsletter emaili
  async sendNewsletter(subscribers, subject, content) {
    try {
      const emailContent = `
        <h2>${subject}</h2>
        ${content}
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
        
        <p style="text-align: center; color: #6c757d; font-size: 12px;">
          Bu emaili almak istemiyorsanız, 
          <a href="${process.env.CLIENT_URL}/unsubscribe" style="color: #6c757d;">buradan</a> 
          aboneliğinizi iptal edebilirsiniz.
        </p>
      `;

      // Her aboneye ayrı email gönder (BCC kullanmak yerine)
      const sendPromises = subscribers.map(subscriber => {
        const mailOptions = {
          from: `"${this.from.name}" <${this.from.email}>`,
          to: subscriber.email,
          subject: subject,
          html: this.getEmailTemplate(emailContent)
        };
        
        return this.transporter.sendMail(mailOptions);
      });

      await Promise.all(sendPromises);
      console.log(`Newsletter ${subscribers.length} kişiye gönderildi`);
    } catch (error) {
      console.error('Newsletter gönderme hatası:', error);
      throw error;
    }
  }

  // Test emaili gönder
  async sendTestEmail(email) {
    try {
      const content = `
        <h2>Test Email</h2>
        <p>Bu bir test emailidir.</p>
        <p>Email servisi düzgün çalışıyor! ✅</p>
      `;

      const mailOptions = {
        from: `"${this.from.name}" <${this.from.email}>`,
        to: email,
        subject: 'Test Email',
        html: this.getEmailTemplate(content)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Test emaili gönderildi: ${email}`);
    } catch (error) {
      console.error('Test emaili gönderme hatası:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();