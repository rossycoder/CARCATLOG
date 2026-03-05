import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PrivacyNoticePage.css';
import SEOHelmet from '../../components/SEO/SEOHelmet';
import Accordion from '../../components/Accordion/Accordion';

const PrivacyNoticePage = () => {
  const location = useLocation();

  const informationCollectedItems = [
    {
      title: 'Account Creation',
      content: (
        <>
          <p>
            When you create an account with us, we will ask for your email address and a password of your choosing. 
            You may also optionally provide your full name and telephone number.
          </p>
          <p>
            After registration, you can manage and update your personal information at any time through your account. 
            Your account also allows you to view and manage your advertisements, subscription details, and payment history.
          </p>
          <p>
            If you later supply your full name or telephone number when placing an order through the website, this 
            information will be stored in your account for future use.
          </p>
        </>
      )
    },
    {
      title: 'Placing an advertisement',
      content: (
        <>
          <p>
            When you submit an advert on the website, we collect certain personal and technical information. This includes 
            your name, telephone number, email address, and postcode, along with details about the vehicle you are advertising, 
            such as the vehicle registration number (VRM).
          </p>
          <p>
            We also gather technical data associated with your use of the website, including your device identifier and IP 
            address, to support the advert submission process and maintain platform security.
          </p>
        </>
      )
    },
    {
      title: 'Communicating with us',
      content: (
        <>
          <p>
            When you get in touch with us, you may choose to share personal information such as your name, postal address, 
            contact information, business or organisation details. We use this information solely to respond to your enquiry 
            and manage our communications with you effectively.
          </p>
          <p className="legal-basis">
            <strong>Legal grounds for processing:</strong> Your consent, our legitimate business interests, performance of 
            a contract or steps taken prior to entering into a contract.
          </p>
        </>
      )
    },
    {
      title: 'Using services on CarCataLog',
      content: (
        <>
          <p>
            When you use CarCataLog services, we may collect certain personal information in order to provide the services 
            you request. This may include your name, email address, phone number, postcode, and details about your vehicle, 
            such as the vehicle registration number, mileage, make, and model.
          </p>
          <p className="legal-basis">
            <strong>Legal basis for processing:</strong> Performance of a contract, your consent, legitimate interests.
          </p>
          <div className="additional-info">
            <h3>More Information About Specific Services</h3>
            <ul>
              <li><strong>Vehicle Valuation</strong> – To receive a vehicle valuation, you must provide details such as the 
              vehicle registration number, mileage, make, and model.</li>
              <li><strong>Vehicle Search</strong> – To use our search function, you need to provide your postcode to see 
              relevant results near you.</li>
            </ul>
          </div>
        </>
      )
    },
    {
      title: 'Information we collect if you use our Mobile Applications',
      content: (
        <>
          <p>
            If you download or access CarCataLog's Mobile Applications, or use a mobile-optimised version of our site, we 
            may collect information about your device and location, including a unique device identifier.
          </p>
          <p className="legal-basis">
            <strong>Legal basis for processing:</strong> Legitimate interests, your consent.
          </p>
        </>
      )
    },
    {
      title: 'Administration, development and monitoring of the Website and Services',
      content: (
        <>
          <p>
            To manage, maintain, and improve the CarCataLog Website and related services, we collect and process information 
            about your contact details and activity on the Website.
          </p>
          <p className="legal-basis">
            <strong>Legal basis for processing:</strong> Legitimate interests, your consent.
          </p>
        </>
      )
    },
    {
      title: 'Information shared with us by third parties',
      content: (
        <>
          <p>We may receive personal information about you from a variety of third-party sources, including:</p>
          <ul>
            <li>Dealers or vehicle manufacturers</li>
            <li>Credit reference agencies such as Equifax and/or Experian</li>
            <li>Companies that collect customer reviews and feedback</li>
            <li>Vehicle manufacturers, finance providers, insurance companies, and other business partners</li>
          </ul>
          <p className="legal-basis">
            <strong>Legal basis for processing:</strong> Your consent, legitimate interests.
          </p>
        </>
      )
    }
  ];

  const legalBasisItems = [
    {
      title: 'The Legal Basis we rely on for processing your information',
      content: (
        <>
          <p>Under data protection laws, we must have a lawful reason to process your personal information. The main legal 
          bases we rely on are:</p>
          
          <h3>Contract</h3>
          <p>
            Processing your personal data is necessary to perform a contract with you, fulfil our contractual obligations, 
            or take steps you request before entering into a contract.
          </p>

          <h3>Consent</h3>
          <p>
            When consent is required for CarCataLog to process certain personal information, it must be given 
            clearly and voluntarily.
          </p>
        </>
      )
    },
    {
      title: 'Consent',
      content: (
        <>
          <p>
            When consent is required for CarCataLog or a dealer to process certain personal information, it must be given 
            clearly and voluntarily. For example, you may provide consent to receive marketing communications from us.
          </p>
          <p>
            If you have given consent for CarCataLog to process your personal data, you can withdraw it at any time by 
            emailing <a href="mailto:dataprotection@carcatalog.co.uk">dataprotection@carcatalog.co.uk</a>.
          </p>
        </>
      )
    },
    {
      title: 'Disclosure of your Information',
      content: (
        <>
          <p>
            CarCataLog will not share your personal information with third parties except as described in this Notice or 
            where you have given your consent. We may disclose your information to third parties in the following circumstances:
          </p>
          <ul>
            <li>We may share your personal data with other companies within the CarCataLog Group.</li>
            <li>We may share your information with partners, dealers, vehicle manufacturers, and finance providers.</li>
            <li>We may share your information if required by law or to comply with legal obligations.</li>
            <li>In the event of a business sale, merger, or acquisition.</li>
          </ul>
        </>
      )
    }
  ];

  return (
    <>
      <SEOHelmet
        title="Privacy Notice - CarCataLog"
        description="Learn how CarCataLog collects, uses, and protects your personal information."
        canonicalUrl="/privacy-notice"
      />
      <div className="privacy-notice-page">
        <div className="privacy-layout">
          <aside className="privacy-sidebar">
            <nav className="sidebar-nav">
              <h3>Accessibility statement</h3>
              <ul>
                <li>
                  <Link 
                    to="/accessibility-statement" 
                    className={location.pathname === '/accessibility-statement' ? 'active' : ''}
                  >
                    Accessibility statement
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/cookies-policy"
                    className={location.pathname === '/cookies-policy' ? 'active' : ''}
                  >
                    Cookie policy
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/privacy-notice"
                    className={location.pathname === '/privacy-notice' ? 'active' : ''}
                  >
                    Privacy notice
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/terms-of-use"
                    className={location.pathname === '/terms-of-use' ? 'active' : ''}
                  >
                    Terms of use
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          <div className="privacy-container">
            <h1>Privacy Notice</h1>
            <p className="last-updated">Last updated: 31 October 2025</p>

            <section className="privacy-section">
              <h2>Information collected by us and how we use it?</h2>
              <Accordion items={informationCollectedItems} allowMultiple={true} />
            </section>

            <section className="privacy-section">
              <h2>The Legal Basis we rely on for processing your information</h2>
              <Accordion items={legalBasisItems} allowMultiple={true} />
            </section>

            <section className="privacy-section contact-section">
              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Notice or how we handle your personal data, please contact us at:
              </p>
              <p>
                Email: <a href="mailto:enquiries@carcatalog.co.uk">enquiries@carcatalog.co.uk</a><br />
                Data Protection: <a href="mailto:dataprotection@carcatalog.co.uk">dataprotection@carcatalog.co.uk</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyNoticePage;
