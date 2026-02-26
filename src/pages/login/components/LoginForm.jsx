import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import Cookies from 'js-cookie';
import { loginUser } from '../../../services/auth';

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('Attempting login for:', formData.email);

      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      console.log('Login successful:', response);

      // ✅ Verify authentication tokens were set by the service
      const authToken = Cookies.get('authToken');
      const isAuthenticated = localStorage.getItem('isAuthenticated');

      if (!authToken || isAuthenticated !== 'true') {
        throw new Error('Authentication failed - no valid session created');
      }

      // ✅ Store user information
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        // Fallback if no user object is returned
        localStorage.setItem(
          'user',
          JSON.stringify({
            email: formData.email,
            name: formData.email.split('@')[0],
          })
        );
      }

      // ✅ Navigate to dashboard
      console.log('Redirecting to dashboard...');
      navigate('/vendor-analytics', { replace: true });

    } catch (error) {
      console.error('Login error:', error);

      // ✅ Clear any partial authentication state
      Cookies.remove('authToken');
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');

      // ✅ Display user-friendly error message
      let errorMessage = 'Login failed. Please try again.';

      if (error instanceof Error) {
        // Check for specific error messages
        if (error.message.includes('Invalid credentials') || 
            error.message.includes('email') || 
            error.message.includes('password')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('network') || 
                   error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border border-border rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Icon name="Store" size={32} color="white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your Sales Bid account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-error/10 border border-error/20 rounded-md p-3 flex items-start space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{errors.general}</p>
            </div>
          )}

          {/* Email Input */}
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            required
            disabled={isLoading}
            autoComplete="email"
          />

          {/* Password Input */}
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            fullWidth
            loading={isLoading}
            iconName="LogIn"
            iconPosition="left"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Sign Up Link */}
        {/* <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginForm;