import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AccessibilityStatementPage.css';
import SEOHelmet from '../../components/SEO/SEOHelmet';

const AccessibilityStatementPage = () => {
  const location = useLocation();

  return (
    <>
      <SEOHelmet
        title="Accessibility Statement - CarCataLog"
        description="Learn about CarCataLog's commitment to web accessibility and how we ensure our website is usable by everyone."
        canonicalUrl="/accessibility-statement"
      />
      <div className="accessibility-page">
        <div className="accessibility-layout">
          <aside className="accessibility-sidebar">
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
          <div className="accessibility-container">
          <h1>Accessibility Statement</h1>
          
          <section className="accessibility-section">
            <p>
              This is the official accessibility statement for CarCataLog. We are committed to ensuring our website is 
              usable by as many people as possible. If you have feedback, questions, or suggestions about accessibility, 
              please contact us at <a href="mailto:enquiries@carcatalog.co.uk">enquiries@carcatalog.co.uk</a>.
            </p>
            <p>
              Our website is built using a progressive enhancement approach. This means that core content and essential 
              features are available across all modern browsers. Even if JavaScript is disabled, users will still be able 
              to search for vehicles and access key information.
            </p>
          </section>

          <section className="accessibility-section">
            <h2>Standards and Guidelines</h2>
            <p>
              Pages on this website are designed to meet WCAG Level A requirements and follow all Priority 1 and most 
              Priority 2 guidelines of the W3C Web Content Accessibility Guidelines. While some guidelines are open to 
              interpretation and cannot be automatically tested, CarCataLog regularly reviews its pages to ensure ongoing 
              compliance.
            </p>
            <ul>
              <li>We aim for our pages to validate against XHTML 1.0 Transitional, with ongoing work to move our most 
              visited pages toward XHTML 1.0 Strict.</li>
              <li>Most pages use valid CSS for layout and styling.</li>
              <li>Semantic and structured markup is used wherever possible. For example, H1 elements identify main headings, 
              while H2 elements are used for subheadings.</li>
              <li>Any applications hosted outside www.carcatalog.co.uk may not fully meet the same standards, but they are 
              continually reviewed and improved for accessibility.</li>
            </ul>
          </section>

          <section className="accessibility-section">
            <h2>Keyboard Navigation</h2>
            
            <h3>Access Keys</h3>
            <p>
              CarCataLog does not currently provide access keys. Support for these features may be considered in the future 
              as part of ongoing accessibility improvements.
            </p>

            <h3>Tab Navigation</h3>
            <p>
              Users can navigate through interactive elements on a page using the Tab key. Pressing Tab moves forward through 
              links, while Shift + Tab moves backward.
            </p>
          </section>

          <section className="accessibility-section">
            <h2>Links</h2>
            <ul>
              <li>Where helpful, links include descriptive title attributes to provide additional context.</li>
              <li>Link text is written clearly so it remains meaningful even when read out of context.</li>
            </ul>
          </section>

          <section className="accessibility-section">
            <h2>Images</h2>
            <ul>
              <li>All informative images include appropriate alternative text (ALT) to support screen readers.</li>
              <li>Decorative images use empty ALT attributes so they are ignored by assistive technologies.</li>
              <li>More complex images include additional descriptions or titles to explain their purpose to non-visual users.</li>
            </ul>
          </section>

          <section className="accessibility-section">
            <h2>Visual Presentation</h2>
            <ul>
              <li>The site layout is controlled using CSS, ensuring content remains accessible even if styles are disabled.</li>
              <li>Font sizes are defined using relative units, allowing users to resize text using browser settings without 
              loss of readability.</li>
            </ul>
          </section>

          <section className="accessibility-section">
            <h2>Feedback and Contact</h2>
            <p>
              We are continuously working to improve the accessibility of our website. If you encounter any accessibility 
              barriers or have suggestions for improvement, please let us know:
            </p>
            <p>
              Email: <a href="mailto:enquiries@carcatalog.co.uk">enquiries@carcatalog.co.uk</a>
            </p>
            <p>
              We welcome your feedback and will do our best to address any concerns promptly.
            </p>
          </section>

          <section className="accessibility-section commitment-section">
            <h2>Our Commitment</h2>
            <p>
              CarCataLog is committed to making our website accessible to all users, including those with disabilities. 
              We believe that everyone should have equal access to information about vehicles and automotive services. 
              We will continue to review and improve our accessibility standards as technology and best practices evolve.
            </p>
          </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccessibilityStatementPage;
