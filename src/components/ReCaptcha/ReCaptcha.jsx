import { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './ReCaptcha.css';

/**
 * ReCaptcha Component - Google reCAPTCHA v2 Integration
 * 
 * Usage:
 * const recaptchaRef = useRef();
 * <ReCaptcha ref={recaptchaRef} onChange={handleRecaptchaChange} />
 * 
 * Get token: recaptchaRef.current.getValue()
 * Reset: recaptchaRef.current.reset()
 */
const ReCaptcha = forwardRef(({ onChange, onExpired, onError, theme = 'light', size = 'normal' }, ref) => {
  const recaptchaRef = useRef();
  
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getValue: () => {
      return recaptchaRef.current?.getValue();
    },
    reset: () => {
      recaptchaRef.current?.reset();
    },
    execute: () => {
      recaptchaRef.current?.execute();
    }
  }));

  // Don't render if no site key configured
  if (!siteKey) {
    console.warn('⚠️ VITE_RECAPTCHA_SITE_KEY not configured');
    return null;
  }

  const handleChange = (token) => {
    if (onChange) {
      onChange(token);
    }
  };

  const handleExpired = () => {
    console.log('⚠️ reCAPTCHA expired');
    if (onExpired) {
      onExpired();
    }
  };

  const handleError = () => {
    console.error('❌ reCAPTCHA error');
    if (onError) {
      onError();
    }
  };

  return (
    <div className="recaptcha-container">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onExpired={handleExpired}
        onErrored={handleError}
        theme={theme}
        size={size}
      />
    </div>
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;
