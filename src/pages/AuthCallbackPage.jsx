import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Handle error
      navigate('/signin?error=' + error);
      return;
    }

    if (token) {
      // Store token and redirect
      localStorage.setItem('token', token);
      setAuthToken(token);
      navigate('/', { replace: true });
    } else {
      // No token, redirect to signin
      navigate('/signin');
    }
  }, [searchParams, navigate, setAuthToken]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Completing sign in...
    </div>
  );
};

export default AuthCallbackPage;
