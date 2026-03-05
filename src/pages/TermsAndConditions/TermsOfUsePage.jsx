import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './TermsOfUsePage.css';
import SEOHelmet from '../../components/SEO/SEOHelmet';

const TermsOfUsePage = () => {
  const location = useLocation();

  return (
    <>
      <SEOHelmet
        title="Terms of Use - CarCataLog"
        description="Read the terms and conditions for using the CarCataLog website and services."
        canonicalUrl="/terms-of-use"
      />
      <div className="terms-of-use-page">
        <div className="terms-layout">
          <aside className="terms-sidebar">
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
          <div className="terms-container">
          <h1>Terms of Use</h1>

          <section className="terms-section intro-section">
            <p>
              Access to the CarCataLog website (the "Website") is subject to the following terms. By using or accessing 
              the Website, you agree to comply with these terms. We may update these terms at any time, and it is your 
              responsibility to review them regularly. Continued use of the Website after updates constitutes acceptance 
              of the revised terms.
            </p>
            <p>
              In these terms: "we/us/our" refers to CarCataLog Limited; "Website" refers to www.carcatalog.co.uk; 
              "you/your" refers to the user of the Website.
            </p>
          </section>

          <section className="terms-section">
            <h2>Access to the Website</h2>
            <p>
              Access to the Website is granted on a temporary basis. We may modify, restrict, or suspend the Website or 
              any part of it at any time without notice. We do not accept liability if the Website is unavailable for any 
              reason. Access may be restricted to registered users in certain areas of the Website.
            </p>
          </section>

          <section className="terms-section">
            <h2>Content</h2>
            <p>When using the Website to search for vehicles or services:</p>
            <ul>
              <li>You may only use, print, or reproduce search results for personal, non-commercial purposes.</li>
              <li>You should only contact private sellers using the details provided for genuine enquiries about vehicles.</li>
              <li>Information on the Website may contain errors or be out of date. We do not guarantee its accuracy or 
              timeliness.</li>
              <li>Content on the Website is for information purposes only and does not constitute professional advice.</li>
              <li>The Website may include content created by private sellers, trade dealers, or third parties. We are not 
              liable for errors, omissions, or illegal content provided by others.</li>
            </ul>

            <h3>We do not guarantee:</h3>
            <ul>
              <li>The completeness or accuracy of the Website or associated websites.</li>
              <li>The authenticity, quality, or ownership of vehicles advertised. While we take reasonable steps to remove 
              fraudulent ads, we cannot guarantee all ads are legitimate.</li>
              <li>Search results from our database or the number of vehicles returned in searches.</li>
            </ul>

            <div className="important-notice">
              <p>
                Purchases of vehicles, goods, or services advertised on the Website are made directly with the third-party 
                seller. CarCataLog is not a party to these transactions. You are responsible for safeguarding your money 
                and verifying sellers. Guidance on buying safely can be found on our Website. Suspicious or fraudulent ads 
                should be reported to us immediately.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <h2>Copyright and Trademarks</h2>
            <p>
              All content, including text, photographs, and databases, is owned or controlled by CarCataLog. All trademarks, 
              logos, and company names are the property of CarCataLog or their respective owners. No rights or licenses are 
              granted to you to use any content, trademarks, or logos without our written permission.
            </p>
            <p>
              You may not reproduce, redistribute, download, mirror, frame, or create derivative works from the Website 
              content without consent. DVLA information is provided for personal use only and must not be used commercially 
              or unlawfully.
            </p>
          </section>

          <section className="terms-section">
            <h2>Liability</h2>
            <p>
              The Website is provided "as is" and "as available." You may encounter content that is inaccurate, offensive, 
              or objectionable. To the extent permitted by law, CarCataLog and its affiliates exclude liability for:
            </p>
            <ul>
              <li>Direct, indirect, or consequential loss or damage, including loss of income, business, profits, data, 
              goodwill, or anticipated savings.</li>
              <li>Any loss arising from reliance on information or content on the Website.</li>
            </ul>
            <p className="liability-note">
              This does not limit our liability for death or personal injury caused by negligence, fraudulent 
              misrepresentation, or any liability that cannot be excluded under law.
            </p>
            <p>
              We cannot guarantee the Website will always be free of viruses or other harmful components. You are 
              responsible for using appropriate security software.
            </p>
          </section>

          <section className="terms-section">
            <h2>Links to Third-Party Websites</h2>
            <p>
              The Website may contain links to third-party websites. We do not control these sites and are not responsible 
              for their content. Inclusion of links does not imply endorsement.
            </p>
            <p>
              You may link to the Website's homepage without consent, provided it does not imply endorsement or sponsorship.
            </p>
          </section>

          <section className="terms-section">
            <h2>Registration</h2>
            <p>
              Some services require free registration. You agree to provide accurate and truthful information, not 
              impersonate others, and avoid offensive usernames. Personal data provided during registration is protected 
              under our Privacy Policy.
            </p>
          </section>

          <section className="terms-section">
            <h2>Vehicle Checks</h2>
            <p>
              Vehicle history and basic checks are provided using third-party data. They are for personal use only, may be 
              printed once, and may not be redistributed. Vehicle checks are informational only and should not be relied on 
              for decision-making. We do not guarantee the completeness or accuracy of checks and exclude liability to the 
              fullest extent permitted by law.
            </p>
          </section>

          <section className="terms-section">
            <h2>General</h2>
            <ul>
              <li>We may assign or subcontract rights and obligations under these terms. You may terminate your account 
              within 5 working days of such assignment.</li>
              <li>These terms, together with our Privacy Policy, form the complete agreement between you and CarCataLog 
              regarding the Website.</li>
              <li>Users must be at least sixteen years old. Minors aged 16–18 must have parental or guardian consent.</li>
              <li>If any term is found invalid or unenforceable, the remainder of the terms remains effective.</li>
              <li>These terms are governed by English law and subject to the exclusive jurisdiction of English courts.</li>
            </ul>
            <p className="important-notice">
              If you do not accept these terms, you must stop using the Website immediately.
            </p>
          </section>

          <section className="terms-section contact-section">
            <h2>Correspondence</h2>
            <p>All inquiries regarding the Website or these terms should be sent to:</p>
            <div className="contact-details">
              <p><strong>CarCataLog Limited</strong></p>
              <p>1 Innovation Way</p>
              <p>Manchester, M15 4FN</p>
              <p>Email: <a href="mailto:enquiries@carcatalog.co.uk">enquiries@carcatalog.co.uk</a></p>
              <p>Telephone: <a href="tel:03451110003">0345 111 0003</a></p>
              <p>Opening hours: Monday – Friday, 9:00am – 5:30pm</p>
              <p className="company-info">
                Registered in England, Company Number: 12345678<br />
                VAT Number: 987654321
              </p>
            </div>
          </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfUsePage;
