import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';
import Cookies from 'js-cookie';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const token = Cookies.get('authToken');

    if (isAuthenticated && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (!payload.exp || payload.exp > currentTime) {
          navigate('/vendor-management-dashboard');
        } else {
          localStorage.removeItem('isAuthenticated');
          Cookies.remove('authToken');
          Cookies.remove('refreshToken');
        }
      } catch (error) {
        localStorage.removeItem('isAuthenticated');
        Cookies.remove('authToken');
        Cookies.remove('refreshToken');
      }
    }
  }, [navigate]);

  const features = [
    {
      title: 'Real-time Analytics',
      description: 'Track bids and vendor performance with live dashboards',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      title: 'Enterprise Security',
      description: 'Bank-level encryption and SOC 2 compliance built in',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      title: 'Smart Automation',
      description: 'Automate vendor workflows and approval processes',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
  ];

  const stats = [
    { value: '500+', label: 'Companies' },
    { value: '10K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* ───────── Left Branding Panel (Desktop) ───────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] bg-slate-950 relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        {/* Decorative geometric shapes — no gradients */}
        <div className="absolute -top-28 -right-28 w-80 h-80 border border-slate-800 rounded-full" />
        <div className="absolute top-16 -right-12 w-52 h-52 border border-slate-800/60 rounded-full" />
        <div className="absolute -bottom-36 -left-36 w-[28rem] h-[28rem] border border-slate-800 rounded-full" />
        <div className="absolute bottom-44 left-24 w-16 h-16 bg-blue-600/10 rounded-2xl rotate-45" />
        <div className="absolute top-[30%] right-[20%] w-3 h-3 bg-blue-500/30 rounded-full" />
        <div className="absolute top-[55%] right-[10%] w-2 h-2 bg-slate-600 rounded-full" />

        {/* Logo */}
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

        {/* Headline + Features */}
        <div className="relative z-10 space-y-10">
          <div>
            <h1 className="text-4xl xl:text-[2.75rem] font-bold text-white leading-tight tracking-tight">
              Smarter Bidding,
              <br />
              <span className="text-blue-400">Better Results.</span>
            </h1>
            <p className="mt-5 text-slate-400 text-[1.05rem] leading-relaxed max-w-md">
              Manage vendors, streamline bids, and make data‑driven
              procurement decisions — all in one platform.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-start space-x-4 bg-slate-800/40 border border-slate-800 rounded-xl px-5 py-4 transition-colors hover:bg-slate-800/60"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600/15 text-blue-400 rounded-lg flex items-center justify-center mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-slate-500 text-sm mt-0.5 leading-snug">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10">
          <div className="flex items-center space-x-8">
            {stats.map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="w-px h-10 bg-slate-800" />}
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ───────── Right Panel — Login Form ───────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Form Area */}
        <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 lg:px-16 xl:px-24">
          <div className="w-full max-w-[26rem] mx-auto">
            {/* Mobile Logo */}
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

            {/* Login Form Component */}
            <LoginForm />

            {/* Security Badges — Mobile / Tablet */}
            <div className="lg:hidden mt-10">
              <SecurityBadges />
            </div>
          </div>
        </div>

        {/* Security Badges — Desktop */}
        <div className="hidden lg:block border-t border-border bg-muted/20 py-8 px-16 xl:px-24">
          <SecurityBadges />
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-5 px-5 sm:px-8 lg:px-16 xl:px-24">
          <div className="max-w-[26rem] mx-auto lg:max-w-none">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-sm text-muted-foreground">
                © {new Date()?.getFullYear()} SalesBid. All rights reserved.
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

export default Login;