import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { microsoftAuth } from '../redux/features/authSlice';

const MicrosoftCallback = () => {
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      // Get the code from URL search params
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      
      if (!code) {
        setError('No authorization code received from Microsoft');
        return;
      }

      try {
        // Remember me state might be stored in localStorage if user checked it on login page
        const rememberMe = localStorage.getItem('rememberMePreference') === 'true';
        
        // Dispatch the microsoftAuth action with the code
        await dispatch(microsoftAuth({ code, rememberMe })).unwrap();
        
        // Clear the temporary rememberMe preference
        localStorage.removeItem('rememberMePreference');
        
        // Navigate to dashboard on success
        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Authentication failed');
        setTimeout(() => {
          navigate('/login', { state: { error: err.message || 'Microsoft authentication failed' } });
        }, 3000);
      }
    };

    handleCallback();
  }, [dispatch, location.search, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          {error ? (
            <>
              <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-gray-500 text-sm">Redirecting you back to the login page...</p>
            </>
          ) : (
            <>
              <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Authenticating with Microsoft</h2>
              <p className="text-gray-600 mb-4">Please wait while we complete your sign in process...</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicrosoftCallback;