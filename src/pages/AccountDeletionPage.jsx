import { Link } from 'react-router-dom';
import './AccountDeletionPage.css';

const AccountDeletionPage = () => {
  return (
    <div className="account-deletion-page">
      <div className="account-deletion-container">

        <div className="account-deletion-header">
          <Link to="/" className="account-deletion-logo">
            <img src="/images/brands/logo.jpeg" alt="CarCatALog" />
          </Link>
        </div>

        <div className="account-deletion-content">
          <h1>Account Deletion Policy</h1>
          <p className="account-deletion-subtitle">Private Sellers &amp; Trade PAYG Users</p>

          <p className="account-deletion-intro">
            At CarCatalog, users have the right to request closure of their account at any time.
          </p>

          <section className="deletion-section">
            <h2>Before Requesting Account Closure</h2>
            <p>Before we can process an account deletion request, you must:</p>
            <ul>
              <li>Remove all active vehicle listings from your account.</li>
              <li>Remove any vehicle adverts saved in draft status.</li>
              <li>Ensure no active listings remain associated with your account.</li>
            </ul>
            <p className="deletion-note">
              Failure to remove active or draft listings may delay the processing of your request.
            </p>
          </section>

          <section className="deletion-section">
            <h2>How to Request Account Deletion</h2>
            <p>
              Once all listings and drafts have been removed, please send an email to:
            </p>
            <a href="mailto:admin@carcatalog.co.uk" className="deletion-email">
              admin@carcatalog.co.uk
            </a>
            <p>Please include:</p>
            <ul>
              <li>Your full name</li>
              <li>Your registered email address</li>
              <li>A request for account closure</li>
            </ul>
          </section>

          <section className="deletion-section">
            <h2>Processing Time</h2>
            <p>
              We aim to review and process all account deletion requests within <strong>14 business days</strong> of receiving a valid request.
            </p>
            <p>
              Once processed, all personal data associated with your account will be permanently deleted in accordance with our Privacy Policy and applicable data protection legislation.
            </p>
          </section>

          <section className="deletion-section">
            <h2>Data Retention</h2>
            <p>
              Please note that certain transaction records may be retained for legal and financial compliance purposes, even after account deletion.
            </p>
          </section>

          <div className="deletion-footer-links">
            <Link to="/account-deletion-trade">Trade Subscription Account Deletion Policy →</Link>
            <Link to="/terms-of-use">Terms of Use</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccountDeletionPage;
