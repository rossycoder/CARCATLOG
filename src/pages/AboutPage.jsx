import { useEffect } from 'react';
import './AboutPage.css';

const AboutPage = () => {
  useEffect(() => {
    document.title = 'About CarCatALog | UK Vehicle Marketplace';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <h1>About CarCatALog</h1>
          <p className="about-hero-subtitle">
            The UK's newest online vehicle listing platform, built on transparency, fairness, and value
          </p>
        </div>
      </section>

      <section className="about-content-section">
        <div className="container">
          <div className="about-content-wrapper">
            
            <div className="about-section">
              <p className="about-intro">
                CarCatALog was created with one clear mission: to deliver a more honest, transparent, and cost-effective alternative to the traditional UK vehicle listing platforms. As the UK's newest online car listing marketplace, we set out to challenge the status quo by putting fairness, clarity, and value at the heart of everything we do.
              </p>
              <p>
                The automotive marketplace has long been dominated by expensive advertising fees, complex pricing structures, and platforms that prioritise profit over people. CarCatALog was built to change that. We believe that buying and selling vehicles should be straightforward, affordable, and built on trust—whether you are a private individual or an established motor trader.
              </p>
            </div>

            <div className="about-section">
              <h2>A Platform Built for Buyers and Sellers</h2>
              <p>
                CarCatALog specialises in cars, bikes, and vans, serving both private sellers and buyers as well as the motor trade. Our platform is designed to make vehicle discovery simple, efficient, and transparent, giving users confidence at every stage of the process.
              </p>
              <p>
                For private sellers, we offer an accessible and affordable way to list vehicles without the inflated costs seen elsewhere. For buyers, we provide a clear, easy-to-navigate marketplace focused on genuine listings and fair pricing.
              </p>
            </div>

            <div className="about-section">
              <h2>Dedicated Solutions for the Motor Trade</h2>
              <p>
                We understand that professional traders require more powerful tools, better visibility, and reliable performance. That's why CarCatALog offers dedicated trade subscription packages, specifically designed to support dealerships and independent traders of all sizes.
              </p>
              <p>Our trade members benefit from:</p>
              <ul className="about-benefits-list">
                <li>A secure, dedicated trade login</li>
                <li>A live dashboard to manage listings and activity in real time</li>
                <li>Tailored subscription options that provide excellent value without unnecessary complexity</li>
                <li>A platform designed to grow alongside your business</li>
              </ul>
              <p>
                By keeping our pricing competitive and our tools practical, we ensure traders can focus on what matters most—selling vehicles efficiently and profitably.
              </p>
            </div>

            <div className="about-section">
              <h2>Transparency, Trust, and Value</h2>
              <p>
                At CarCatALog, transparency is not a feature—it's a principle. We are committed to clear pricing, straightforward subscriptions, and a user experience that treats all customers fairly. Our goal is to build long-term trust by offering a platform that genuinely works for its users, not against them.
              </p>
              <p>
                As we continue to grow, our focus remains on innovation, user feedback, and maintaining a marketplace that reflects the real needs of the UK automotive community.
              </p>
            </div>

            <div className="about-section">
              <h2>The Future of Vehicle Listings in the UK</h2>
              <p>
                CarCatALog is more than just another vehicle listing website. It is a modern, customer-first platform designed to redefine how vehicles are bought and sold online in the UK. By combining affordability, professionalism, and transparency, we aim to become the go-to marketplace for private sellers, buyers, and motor traders alike.
              </p>
              <p className="about-closing">
                <strong>Welcome to CarCatALog—the smarter, fairer way to buy and sell vehicles online.</strong>
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
