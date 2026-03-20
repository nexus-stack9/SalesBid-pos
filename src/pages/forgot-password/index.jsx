import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/vendor-password/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccessMessage('OTP sent successfully! Please check your email.');
      localStorage.setItem('resetEmail', formData.email);
      
      setTimeout(() => {
        navigate('/otp-verify');
      }, 1500);

    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({
        general: error.message || 'Failed to send OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] bg-slate-950 relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        <div className="absolute -top-28 -right-28 w-80 h-80 border border-slate-800 rounded-full" />
        <div className="absolute top-16 -right-12 w-52 h-52 border border-slate-800/60 rounded-full" />
        <div className="absolute -bottom-36 -left-36 w-[28rem] h-[28rem] border border-slate-800 rounded-full" />
        <div className="absolute bottom-44 left-24 w-16 h-16 bg-blue-600/10 rounded-2xl rotate-45" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              SalesBid
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl xl:text-[2.75rem] font-bold text-white leading-tight tracking-tight">
              Reset Your
              <br />
              <span className="text-blue-400">Password</span>
            </h1>
            <p className="mt-5 text-slate-400 text-[1.05rem] leading-relaxed max-w-md">
              Enter your registered email address and we'll send you a one-time password to reset your account.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-4 bg-slate-800/40 border border-slate-800 rounded-xl px-5 py-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600/15 text-blue-400 rounded-lg flex items-center justify-center mt-0.5">
                <Icon name="Mail" size={20} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Check Your Inbox</p>
                <p className="text-slate-500 text-sm mt-0.5 leading-snug">
                  We'll send an OTP to your registered email
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-slate-800/40 border border-slate-800 rounded-xl px-5 py-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600/15 text-blue-400 rounded-lg flex items-center justify-center mt-0.5">
                <Icon name="Shield" size={20} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Secure Process</p>
                <p className="text-slate-500 text-sm mt-0.5 leading-snug">
                  Your security is our top priority
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-4 text-slate-500 text-sm">
          <Icon name="Lock" size={16} />
          <span>Secure password reset process</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 lg:px-16 xl:px-24">
          <div className="w-full max-w-[26rem] mx-auto">
            <div className="lg:hidden mb-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-foreground tracking-tight">
                  SalesBid
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name="KeyRound" size={32} className="text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Forgot Password?
                </h1>
                <p className="text-muted-foreground">
                  No worries, we'll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="bg-error/10 border border-error/20 rounded-md p-3 flex items-start space-x-2">
                    <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error">{errors.general}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-success/10 border border-success/20 rounded-md p-3 flex items-start space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-success">{successMessage}</p>
                  </div>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="Enter your registered email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  variant="default"
                  fullWidth
                  loading={isLoading}
                  iconName="Send"
                  iconPosition="left"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  disabled={isLoading}
                >
                  <Icon name="ArrowLeft" size={16} />
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-border bg-card py-5 px-5 sm:px-8 lg:px-16 xl:px-24">
          <div className="max-w-[26rem] mx-auto lg:max-w-none">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} SalesBid. All rights reserved.
              </p>
              <div className="flex items-center space-x-5">
                {['Privacy Policy', 'Terms of Service', 'Support'].map(
                  (link) => (
                    <a
                      key={link}
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ForgotPassword;
