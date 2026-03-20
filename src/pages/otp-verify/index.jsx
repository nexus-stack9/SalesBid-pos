import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const OTPVerify = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const otpInputRef = useRef(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem('resetEmail');
    if (!storedEmail) {
      navigate('/forgot-password');
      return;
    }
    setEmail(storedEmail);
    
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    } else if (!/^\d+$/.test(formData.otp)) {
      newErrors.otp = 'OTP must contain only numbers';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'otp') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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
      const response = await fetch(`${API_BASE_URL}/auth/vendor-password/verify-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccessMessage('Password reset successfully! You can now login with your new password.');
      localStorage.removeItem('resetEmail');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({
        general: error.message || 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForgot = () => {
    navigate('/forgot-password');
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
              Verify & Set
              <br />
              <span className="text-blue-400">New Password</span>
            </h1>
            <p className="mt-5 text-slate-400 text-[1.05rem] leading-relaxed max-w-md">
              Enter the 6-digit OTP sent to your email and create a new secure password for your account.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-4 bg-slate-800/40 border border-slate-800 rounded-xl px-5 py-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600/15 text-blue-400 rounded-lg flex items-center justify-center mt-0.5">
                <Icon name="ShieldCheck" size={20} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Enter OTP</p>
                <p className="text-slate-500 text-sm mt-0.5 leading-snug">
                  6-digit code sent to your email
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-slate-800/40 border border-slate-800 rounded-xl px-5 py-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600/15 text-blue-400 rounded-lg flex items-center justify-center mt-0.5">
                <Icon name="Lock" size={20} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Set New Password</p>
                <p className="text-slate-500 text-sm mt-0.5 leading-snug">
                  Choose a strong password
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-slate-400 text-sm mb-2">
              <Icon name="Info" size={16} />
              <span className="font-medium text-slate-300">Password Requirements</span>
            </div>
            <ul className="space-y-1 text-slate-500 text-sm">
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={14} />
                <span>At least 6 characters long</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={14} />
                <span>Use a mix of letters and numbers</span>
              </li>
            </ul>
          </div>
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
                  <Icon name="ShieldCheck" size={32} className="text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Verify OTP & Reset Password
                </h1>
                <p className="text-muted-foreground">
                  Enter the code sent to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="------"
                    maxLength={6}
                    className={`w-full h-12 text-center text-2xl tracking-[0.5em] font-mono bg-background border rounded-md px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      errors.otp 
                        ? 'border-error focus:ring-error/50' 
                        : 'border-border focus:ring-primary/50'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.otp && (
                    <p className="text-xs text-error mt-1">{errors.otp}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      className={`w-full h-11 bg-background border rounded-md px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        errors.newPassword 
                          ? 'border-error focus:ring-error/50' 
                          : 'border-border focus:ring-primary/50'
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name={passwordVisible ? 'EyeOff' : 'Eye'} size={18} />
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-error mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={confirmPasswordVisible ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      className={`w-full h-11 bg-background border rounded-md px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        errors.confirmPassword 
                          ? 'border-error focus:ring-error/50' 
                          : 'border-border focus:ring-primary/50'
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name={confirmPasswordVisible ? 'EyeOff' : 'Eye'} size={18} />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-error mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="default"
                  fullWidth
                  loading={isLoading}
                  iconName="Check"
                  iconPosition="left"
                  disabled={isLoading || successMessage}
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleBackToForgot}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  disabled={isLoading}
                >
                  <Icon name="ArrowLeft" size={16} />
                  Back to Forgot Password
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

export default OTPVerify;
