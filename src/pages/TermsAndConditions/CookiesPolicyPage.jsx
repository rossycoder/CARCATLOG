import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './CookiesPolicyPage.css';
import SEOHelmet from '../../components/SEO/SEOHelmet';

const CookiesPolicyPage = () => {
  const location = useLocation();

  return (
    <>
      <SEOHelmet
        title="Cookies Policy - CarCataLog"
        description="Learn how CarCataLog uses cookies and related technologies to improve your experience."
        canonicalUrl="/cookies-policy"
      />
      <div className="cookies-policy-page">
        <div className="cookies-layout">
          <aside className="cookies-sidebar">
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
          <div className="cookies-container">
          <h1>Cookies Policy</h1>
          <p className="last-updated">Last updated: 31 October 2025</p>

          <section className="cookies-section">
            <p>
              This Cookie Policy explains how CarCataLog uses cookies and related technologies when you visit our website 
              or use our mobile application (together referred to as the "Site"). Please take a moment to read this policy 
              to understand how and why cookies are used.
            </p>
          </section>

          <section className="cookies-section">
            <h2>What are cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit our Site. They 
              help us recognise your device and remember information about your preferences or previous interactions.
            </p>
            <p>
              We also use similar technologies, such as device identifiers, tracking pixels, and link tracking (including 
              within our mobile app). For simplicity, all of these technologies are referred to as "cookies" in this policy.
            </p>
            <p>
              Some cookies are strictly necessary for the Site to operate correctly. Other cookies are optional and are only 
              used with your consent.
            </p>
          </section>

          <section className="cookies-section">
            <h2>How we use cookies</h2>
            
            <h3>Essential cookies</h3>
            <p>Certain cookies are required to ensure the Site works properly and securely. These cookies are used to:</p>
            <ul>
              <li>Enable core website functionality and maintain security;</li>
              <li>Recognise returning users and improve usability, such as remembering preferences or saved searches;</li>
              <li>Collect aggregated and anonymised data about Site usage to help us improve our services; and</li>
              <li>Identify, investigate, and fix technical issues.</li>
            </ul>
            <p className="important-note">These cookies are essential and cannot be disabled.</p>

            <h3>Optional (non-essential) cookies</h3>
            <p>With your consent, we also use non-essential cookies to:</p>
            <ul>
              <li>Analyse how visitors interact with the Site so we can test features and improve performance;</li>
              <li>Understand your vehicle search behaviour when you submit an enquiry or engage with a dealer, helping us 
              and our partners provide a more relevant and personalised experience;</li>
              <li>Evaluate the effectiveness of our advertising and marketing campaigns; and</li>
              <li>Share information with social media, advertising, and analytics partners, who may combine it with other 
              data you have provided to them or that they have collected through your use of their services.</li>
            </ul>
            <p>
              For the best CarCataLog experience, we recommend selecting "accept all" cookies. You can still use the Site 
              if you choose to limit cookies, but some features or personalisation may not function as intended.
            </p>
          </section>

          <section className="cookies-section">
            <h2>Managing your cookies</h2>
            <p>
              You can manage, restrict, or delete cookies at any time by visiting Manage your cookies or by adjusting your 
              browser settings. Each browser works differently, so please refer to your browser's help section for guidance 
              on how to change your cookie preferences.
            </p>
            <p>Further details about the specific cookies we use can be found below.</p>
          </section>

          <section className="cookies-section">
            <h2>Third-party cookies</h2>
            <p>
              We work with carefully selected third-party partners who may place cookies on your device when you visit the 
              CarCataLog Site. These partners may use cookies to display products or services that are more relevant to your 
              interests.
            </p>
            <p>
              If you wish to opt out of third-party advertising cookies, you can do so via Manage your cookies or by using 
              the Digital Advertising Alliance's WebChoices tool (opens in a new window; please note that we are not 
              responsible for the content of external websites).
            </p>
          </section>

          <section className="cookies-section cookie-types">
            <h2>Types of Cookies We Use</h2>
            
            <div className="cookie-type">
              <h3>Strictly Necessary Cookies</h3>
              <p>
                These cookies are essential for the website to function and cannot be switched off. They are usually only 
                set in response to actions made by you, such as setting your privacy preferences, logging in, or filling 
                in forms.
              </p>
            </div>

            <div className="cookie-type">
              <h3>Performance Cookies</h3>
              <p>
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance 
                of our site. They help us understand which pages are the most and least popular and see how visitors move 
                around the site.
              </p>
            </div>

            <div className="cookie-type">
              <h3>Functional Cookies</h3>
              <p>
                These cookies enable the website to provide enhanced functionality and personalisation. They may be set by 
                us or by third-party providers whose services we have added to our pages.
              </p>
            </div>

            <div className="cookie-type">
              <h3>Targeting Cookies</h3>
              <p>
                These cookies may be set through our site by our advertising partners. They may be used by those companies 
                to build a profile of your interests and show you relevant adverts on other sites.
              </p>
            </div>
          </section>

          <section className="cookies-section">
            <h2>How to Control Cookies</h2>
            <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by:</p>
            <ul>
              <li>Setting your preferences through our cookie consent banner when you first visit the site</li>
              <li>Adjusting your browser settings to refuse all or some browser cookies</li>
              <li>Visiting our cookie management page to update your preferences at any time</li>
            </ul>
            <p>
              Please note that if you choose to refuse cookies, you may not be able to use the full functionality of our 
              website.
            </p>
          </section>

          <section className="cookies-section contact-section">
            <h2>Questions About Cookies</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please contact us at:
            </p>
            <p>
              Email: <a href="mailto:enquiries@carcatalog.co.uk">enquiries@carcatalog.co.uk</a><br />
              Data Protection: <a href="mailto:dataprotection@carcatalog.co.uk">dataprotection@carcatalog.co.uk</a>
            </p>
          </section>

          <section className="cookies-section updates-section">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our 
              business operations. We encourage you to review this page periodically to stay informed about how we use 
              cookies.
            </p>
          </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiesPolicyPage;
