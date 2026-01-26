import { useState, useRef } from 'react';
import ReCaptcha from '../components/ReCaptcha/ReCaptcha';

/**
 * Example: How to use ReCaptcha component in your forms
 * 
 * This example shows integration with Sign In, Sign Up, and Forgot Password forms
 */

// Example 1: Sign In Form
export const SignInFormExample = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken // Send token to backend
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Login successful!');
      } else {
        // Reset reCAPTCHA on error
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (error) {
      console.error('Login error:', error);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      
      {/* Add ReCaptcha Component */}
      <ReCaptcha 
        ref={recaptchaRef}
        onChange={handleRecaptchaChange}
      />
      
      <button type="submit" disabled={!recaptchaToken}>
        Sign In
      </button>
    </form>
  );
};

// Example 2: Sign Up Form
export const SignUpFormExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Registration successful!');
      } else {
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (error) {
      console.error('Registration error:', error);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Full Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      <input
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        placeholder="Confirm Password"
        required
      />
      
      {/* Add ReCaptcha Component */}
      <ReCaptcha 
        ref={recaptchaRef}
        onChange={handleRecaptchaChange}
      />
      
      <button type="submit" disabled={!recaptchaToken}>
        Sign Up
      </button>
    </form>
  );
};

// Example 3: Forgot Password Form
export const ForgotPasswordFormExample = () => {
  const [email, setEmail] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          recaptchaToken
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Password reset email sent!');
      } else {
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      
      {/* Add ReCaptcha Component */}
      <ReCaptcha 
        ref={recaptchaRef}
        onChange={handleRecaptchaChange}
      />
      
      <button type="submit" disabled={!recaptchaToken}>
        Send Reset Link
      </button>
    </form>
  );
};

/**
 * Key Points:
 * 
 * 1. Import ReCaptcha component
 * 2. Create a ref: const recaptchaRef = useRef()
 * 3. Create state for token: const [recaptchaToken, setRecaptchaToken] = useState(null)
 * 4. Add onChange handler: const handleRecaptchaChange = (token) => setRecaptchaToken(token)
 * 5. Add ReCaptcha component: <ReCaptcha ref={recaptchaRef} onChange={handleRecaptchaChange} />
 * 6. Send recaptchaToken in API request body
 * 7. Reset on error: recaptchaRef.current?.reset()
 * 8. Disable submit button until token exists: disabled={!recaptchaToken}
 */
