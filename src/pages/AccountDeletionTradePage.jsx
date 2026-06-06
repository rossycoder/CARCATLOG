import { Link } from 'react-router-dom';
import './AccountDeletionPage.css';

const AccountDeletionTradePage = () => {
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
          <p className="account-deletion-subtitle">Trade Subscription Users</p>

          <p className="account-deletion-intro">
            At CarCatalog, trade subscription customers may request account closure and cancellation
            of their subscription at any time, subject to the conditions below.
          </p>

          <section className="deletion-section">
            <h2>Before Requesting Account Closure</h2>
            <p>Before we can process an account deletion request, you must:</p>
            <ul>
              <li>Remove all active vehicle listings.</li>
              <li>Remove any vehicle adverts saved in draft status.</li>
              <li>Ensure no active inventory remains associated with your account.</li>
            </ul>
          </section>

          <section className="deletion-section">
            <h2>Subscription Cancellation Requirements</h2>
            <p>
              To ensure cancellation before your next billing cycle, your account deletion request
              must be submitted <strong>no later than 7 days before</strong> your next monthly
              subscription renewal date.
            </p>
            <p className="deletion-note">
              Requests received less than 7 days before renewal may not be processed before the
              next billing cycle, and the subscription fee for that period will not be refunded.
            </p>
          </section>

          <section className="deletion-section">
            <h2>How to Request Account Deletion</h2>
            <p>
              Once all listings have been removed and the 7-day notice period is met, please send
              an email to:
            </p>
            <a href="mailto:admin@carcatalog.co.uk" className="deletion-email">
              admin@carcatalog.co.uk
            </a>
            <p>Please include:</p>
            <ul>
              <li>Your business name</li>
              <li>Your registered email address</li>
              <li>Your account/subscription ID (if available)</li>
              <li>A request for account closure and subscription cancellation</li>
            </ul>
          </section>

          <section className="deletion-section">
            <h2>Processing Time</h2>
            <p>
              We aim to review and process all account deletion requests within <strong>14 business days</strong> of receiving a valid request.
            </p>
            <p>
              Once processed, all personal and business data associated with your account will be
              permanently deleted in accordance with our Privacy Policy and applicable data
              protection legislation.
            </p>
          </section>

          <section className="deletion-section">
            <h2>Refund Policy</h2>
            <p>
              Subscription fees already charged are non-refundable unless required by applicable
              consumer protection law. No partial refunds will be issued for unused days within a
              billing period.
            </p>
          </section>

          <section className="deletion-section">
            <h2>Data Retention</h2>
            <p>
              Certain transaction and financial records may be retained for legal and financial
              compliance purposes, even after account deletion.
            </p>
          </section>

          <div className="deletion-footer-links">
            <Link to="/account-deletion">Private Seller Account Deletion Policy →</Link>
            <Link to="/terms-of-use">Terms of Use</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccountDeletionTradePage;
