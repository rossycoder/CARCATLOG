import { useState, useEffect } from 'react';
import './ComingSoonPage.css';

// Launch date — Tuesday 26 May 2026 at 1:00 PM
const LAUNCH_DATE = new Date('2026-05-26T13:00:00');

function getTimeLeft() {
  const diff = LAUNCH_DATE - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="cs-page">
      {/* Background video — desktop: landscape, mobile: portrait reel */}
      <video
        className="cs-video cs-video-desktop"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/brands/background1.jpeg"
      >
        <source src="https://res.cloudinary.com/dexgkptpg/video/upload/v1779441928/carcatalog/landingvideo.mp4" type="video/mp4" />
      </video>
      <video
        className="cs-video cs-video-mobile"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/brands/backgroundmobile.png"
      >
        <source src="https://res.cloudinary.com/dexgkptpg/video/upload/v1779441950/carcatalog/reel.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="cs-overlay" />

      {/* Content */}
      <div className="cs-content">
        {/* Logo */}
        <img src="/images/brands/logo.jpeg" alt="CarCatALog" className="cs-logo" />

        <p className="cs-tagline">The smarter way to buy &amp; sell your car</p>

        <h1 className="cs-headline">Launching Soon</h1>

        {/* Countdown */}
        <div className="cs-countdown">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.minutes },
            { label: 'Secs', value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div className="cs-tile" key={label}>
              <span className="cs-tile-num">{String(value).padStart(2, '0')}</span>
              <span className="cs-tile-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Email signup */}
        {submitted ? (
          <p className="cs-thanks">Thanks! We'll notify you when we launch.</p>
        ) : (
          <form className="cs-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="cs-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="cs-btn">Notify me</button>
          </form>
        )}

        {/* Instagram */}
        <a
          href="https://www.instagram.com/carcatalog.co.uk/"
          target="_blank"
          rel="noopener noreferrer"
          className="cs-instagram"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Follow us on Instagram
        </a>
      </div>
    </div>
  );
}
