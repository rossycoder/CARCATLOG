/**
 * Email Service
 * Handles sending emails for various events using Nodemailer with Gmail
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.enabled = process.env.EMAIL_SERVICE === 'gmail';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@carcatalog.com';
    
    // Create transporter for Gmail
    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  /**
   * Send email using Gmail
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} text - Plain text content
   * @param {string} html - HTML content
   * @returns {Promise<boolean>}
   */
  async sendEmail(to, subject, text, html) {
    try {
      if (!this.enabled) {
        console.log('📧 Email disabled - Would send to:', to);
        console.log('   Subject:', subject);
        return true;
      }

      const mailOptions = {
        from: this.fromEmail,
        to,
        subject,
        text,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  /**
   * Send advertising package purchase confirmation email
   * @param {Object} purchase - Purchase record
   * @returns {Promise<boolean>}
   */
  async sendAdvertisingPackageConfirmation(purchase) {
    try {
      if (!this.enabled) {
        console.log('📧 Email disabled - Would send confirmation to:', purchase.customerEmail);
        console.log('   Package:', purchase.packageName);
        console.log('   Amount:', purchase.amountFormatted);
        return true;
      }

      const emailData = {
        to: purchase.customerEmail,
        from: this.fromEmail,
        subject: `Payment Confirmed - ${purchase.packageName}`,
        html: this.generateAdvertisingConfirmationHTML(purchase),
        text: this.generateAdvertisingConfirmationText(purchase)
      };

      // TODO: Implement actual email sending
      console.log('📧 Sending confirmation email:', emailData);
      
      return true;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return false;
    }
  }

  /**
   * Generate HTML email for advertising package confirmation
   * @param {Object} purchase - Purchase record
   * @returns {string}
   */
  generateAdvertisingConfirmationHTML(purchase) {
    const expiryText = purchase.expiresAt 
      ? `Your package will expire on ${new Date(purchase.expiresAt).toLocaleDateString()}`
      : 'Your package is active until your vehicle is sold';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: white; }
          .logo-header { background: white; padding: 15px 20px; text-align: left; border-bottom: 2px solid #e0e0e0; }
          .logo { max-width: 120px; height: auto; display: block; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .button { display: inline-block; background: #667eea !important; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-header">
            <img src="https://res.cloudinary.com/dexgkptpg/image/upload/v1765219299/carcatalog/logo.jpg" alt="CarCatalog Logo" class="logo" />
          </div>
          <div class="header">
            <h1>✅ Payment Confirmed!</h1>
            <p>Your advertising package is now active</p>
          </div>
          
          <div class="content">
            <p>Hi${purchase.customerName ? ' ' + purchase.customerName : ''},</p>
            
            <p>Thank you for your purchase! Your ${purchase.packageName} is now active and ready to use.</p>
            
            <div class="detail-box">
              <h3>Purchase Details</h3>
              <div class="detail-row">
                <span class="label">Package:</span>
                <span class="value">${purchase.packageName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">${purchase.duration}</span>
              </div>
              <div class="detail-row">
                <span class="label">Amount Paid:</span>
                <span class="value">${purchase.amountFormatted}</span>
              </div>
              ${purchase.registration ? `
              <div class="detail-row">
                <span class="label">Vehicle:</span>
                <span class="value">${purchase.registration}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="label">Purchase Date:</span>
                <span class="value">${new Date(purchase.paidAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Create your car advertisement with photos and details</li>
              <li>Your listing will go live immediately after submission</li>
              <li>You'll receive email notifications for buyer inquiries</li>
              <li>Track your ad performance in your dashboard</li>
            </ul>
            
            <p>${expiryText}</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/find-your-car" class="button">Create Your Ad Now</a>
            </center>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The CarCatalog Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} CarCatalog. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email for advertising package confirmation
   * @param {Object} purchase - Purchase record
   * @returns {string}
   */
  generateAdvertisingConfirmationText(purchase) {
    const expiryText = purchase.expiresAt 
      ? `Your package will expire on ${new Date(purchase.expiresAt).toLocaleDateString()}`
      : 'Your package is active until your vehicle is sold';

    return `
Payment Confirmed!

Hi${purchase.customerName ? ' ' + purchase.customerName : ''},

Thank you for your purchase! Your ${purchase.packageName} is now active and ready to use.

Purchase Details:
- Package: ${purchase.packageName}
- Duration: ${purchase.duration}
- Amount Paid: ${purchase.amountFormatted}
${purchase.registration ? `- Vehicle: ${purchase.registration}\n` : ''}- Purchase Date: ${new Date(purchase.paidAt).toLocaleDateString()}

What's Next?
- Create your car advertisement with photos and details
- Your listing will go live immediately after submission
- You'll receive email notifications for buyer inquiries
- Track your ad performance in your dashboard

${expiryText}

Create your ad now: ${process.env.FRONTEND_URL}/find-your-car

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The CarCatalog Team

---
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} CarCatalog. All rights reserved.
    `.trim();
  }

  /**
   * Send payment failure notification
   * @param {string} email - Customer email
   * @param {Object} details - Failure details
   * @returns {Promise<boolean>}
   */
  async sendPaymentFailureNotification(email, details) {
    try {
      if (!this.enabled) {
        console.log('📧 Email disabled - Would send failure notification to:', email);
        return true;
      }

      // TODO: Implement actual email sending
      console.log('📧 Sending payment failure notification to:', email);
      
      return true;
    } catch (error) {
      console.error('Error sending failure notification:', error);
      return false;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export both the class and helper function
module.exports = EmailService;
module.exports.sendEmail = (to, subject, text, html) => emailService.sendEmail(to, subject, text, html);





