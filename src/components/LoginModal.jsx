import React, { useEffect, useMemo, useState } from 'react';
import { X, User, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';

const LoginModal = ({ type, isOpen, onClose }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Debounce username changes for student preview
  const debouncedUsername = useMemo(() => credentials.username, [credentials.username]);

  useEffect(() => {
    if (type !== 'student') {
      setProfile(null);
      return;
    }
    if (!debouncedUsername) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        setIsProfileLoading(true);
        const res = await studentAPI.getProfile(debouncedUsername);
        if (!cancelled) {
          setProfile(res?.student || null);
        }
      } catch (_err) {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setIsProfileLoading(false);
      }
    };
    const t = setTimeout(fetchProfile, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUsername, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Debug logs
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Username:', credentials.username);
      console.log('Role:', type);
      console.log('Full credentials:', { ...credentials, role: type });

      const result = await login({
        ...credentials,
        role: type
      });

      console.log('=== LOGIN RESPONSE ===');
      console.log('Full result:', result);
      console.log('Success:', result.success);

      if (result.success) {
        console.log('✅ Login successful, redirecting to:', `/dashboard/${type}`);
        // First close the modal
        onClose();
        
        // Wait for next tick to ensure auth context is updated
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Then navigate
        navigate(`/dashboard/${type}`, { replace: true });
      } else {
        console.log('❌ Login failed:', result.error);
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.log('=== LOGIN ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'student': return 'Student Login';
      case 'faculty': return 'Faculty Login';
      case 'admin': return 'Admin Login';
      default: return 'Login';
    }
  };

  const getPlaceholderText = () => {
    switch (type) {
      case 'student': return 'Student ID';
      case 'faculty': return 'Faculty ID';
      case 'admin': return 'Admin Username';
      default: return 'Username';
    }
  };

  const getRoleColor = () => {
    switch (type) {
      case 'student': return 'blue';
      case 'faculty': return 'green';
      case 'admin': return 'purple';
      default: return 'blue';
    }
  };

  if (!isOpen) return null;

  const color = getRoleColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className={`bg-${color}-600 px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-semibold text-white">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Student Preview Card */}
          {type === 'student' && credentials.username && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {isProfileLoading ? (
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  ) : profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="Student" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile?.name || 'Loading...'}
                  </p>
                  {profile?.student_id && (
                    <p className="text-xs text-gray-500">ID: {profile.student_id}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  placeholder={getPlaceholderText()}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Demo Credentials:</p>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
              {type === 'student' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Username:</span>
                    <span className="font-mono font-medium">student123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Password:</span>
                    <span className="font-mono font-medium">password123</span>
                  </div>
                </>
              )}
              {type === 'faculty' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Username:</span>
                    <span className="font-mono font-medium">faculty456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Password:</span>
                    <span className="font-mono font-medium">password456</span>
                  </div>
                </>
              )}
              {type === 'admin' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Username:</span>
                    <span className="font-mono font-medium">admin789</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Password:</span>
                    <span className="font-mono font-medium">password789</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;