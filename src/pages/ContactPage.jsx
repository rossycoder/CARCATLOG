import { FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';
import './ContactPage.css';

const ContactPage = () => {
  const contactOptions = [
    {
      icon: FaWhatsapp,
      buttonText: 'WhatsApp',
      title: 'WhatsApp',
      description: 'The fastest way to get a response.',
      action: () => window.open('https://wa.me/447123456789?text=Hello, I have a question about CarCatalog', '_blank')
    },
    {
      icon: FaPhone,
      buttonText: 'Call us',
      title: 'Call us',
      description: 'Lines open: Mon-Sat: 9am to 5pm',
      action: () => window.location.href = 'tel:+447123456789'
    },
    {
      icon: FaEnvelope,
      buttonText: 'Email us',
      title: 'Email us',
      description: 'We will reply as soon as we can. Usually within 3 business days.',
      action: () => window.location.href = 'mailto:contact@carcatalog.com'
    }
  ];

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>We're here to help. Choose how you'd like to get in touch.</p>
        </div>
      </div>

      <div className="contact-cards-section">
        <div className="contact-cards-container">
          {contactOptions.map((option, index) => (
            <div key={index} className="contact-card">
              <button className="contact-card-button" onClick={option.action}>
                {option.buttonText}
              </button>
              <h3 className="contact-card-title">{option.title}</h3>
              <p className="contact-card-description">{option.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
