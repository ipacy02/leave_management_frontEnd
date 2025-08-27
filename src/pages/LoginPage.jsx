import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, resetAuthState, clearError } from '../redux/features/authSlice';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check for error passed from Microsoft callback
    if (location.state?.error) {
      toast.error(location.state.error);
      
      // Clear the location state to prevent showing the error again on refresh
      window.history.replaceState({}, document.title);
    }

    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch, location.state]);

  useEffect(() => {
    // Redirect if authenticated and show success toast
    if (isAuthenticated) {
      toast.success('Successfully logged in!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
          color: '#fff',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        icon: '👋',
      });
      
      // Short delay before navigation for better UX
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  }, [isAuthenticated, navigate]);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Simple password strength checker
    let strength = 0;
    if (newPassword.length > 5) strength += 1;
    if (newPassword.length > 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email and password before submitting
    if (!email || !password) {
      toast.error('Please provide both email and password');
      return;
    }
    
    dispatch(login({ email, password, rememberMe }));
  };

  const handleMicrosoftLogin = () => {
    // Store rememberMe preference in localStorage so it can be retrieved in the callback
    localStorage.setItem('rememberMePreference', rememberMe);
    
    // Get the Microsoft OAuth URL from the backend
    // In production, this would be an API call to fetch the URL
    
    // For development, we can use this URL format based on your backend configuration
    const msRedirectUri = encodeURIComponent(`${window.location.origin}/api/v1/auth/microsoft/callback`);
    const scope = encodeURIComponent('openid profile email offline_access');
    
    // Replace with the correct client ID from your application.properties
    const tenantId = '6c03dbed-7867-49e9-a279-93c5c7b6ef70';
    const clientId = '110cadeb-83dd-46d0-80ef-927817d102d0'; // CORRECTED: Using proper client ID
    
    const microsoftAuthUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${msRedirectUri}&response_mode=query&scope=${scope}`;
    
    // Redirect to Microsoft login
    window.location.href = microsoftAuthUrl;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col items-center justify-center p-4">
      {/* Toast Component */}
      <Toaster />
      
      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">AfriHR</span>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-700 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500 opacity-20 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500 opacity-20 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white text-center relative z-10">Welcome Back</h2>
            <p className="text-indigo-100 text-center mt-2 relative z-10">Log in to your AfriHR dashboard</p>
          </div>

          {/* Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-8"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center text-sm"
              >
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {password && (
                  <div className="mt-1">
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            passwordStrength >= level 
                              ? level <= 2 
                                ? 'bg-red-400' 
                                : level <= 3 
                                  ? 'bg-yellow-400' 
                                  : 'bg-green-400'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {passwordStrength <= 2 && "Weak password"}
                      {passwordStrength === 3 && "Moderate password"}
                      {passwordStrength > 3 && "Strong password"}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Remember Me and Forgot Password */}
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative inline-flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="opacity-0 absolute h-5 w-5 cursor-pointer"
                    />
                    <div className={`border h-5 w-5 rounded flex items-center justify-center mr-2 ${
                      rememberMe 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'border-gray-300'
                    }`}>
                      {rememberMe && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <label htmlFor="remember-me" className="text-sm text-gray-700 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </motion.div>

              {/* Login Button */}
              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                    loading ? 'opacity-80 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </motion.div>

              {/* Social Login Buttons */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3">
                {/* Microsoft Login Button */}
                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  Sign in with Microsoft
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 text-center text-sm text-gray-500"
      >
        <p>© 2025 AfriHR. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a>
        </div>
      </motion.div>
    </div>
  );
}