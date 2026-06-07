/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Globe,
  Shuffle,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ssoMode, setSsoMode] = useState(false);
  const [ssoDomain, setSsoDomain] = useState('');

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    setIsLoading(true);

    // Simulate verified credential check
    setTimeout(() => {
      setIsLoading(false);
      // Let's accept admin@epma.com / admin123 or any password >= 6 chars for simplicity, 
      // but explicitly advise about default demo values.
      if (email.toLowerCase() === 'admin@epma.com' && password === 'admin123') {
        onLoginSuccess(email);
      } else if (password.length >= 6) {
        // Accept any long password as an interactive playground convenience
        onLoginSuccess(email);
      } else {
        setError('Invalid credentials. Use admin@epma.com and password admin123 to login instantly.');
      }
    }, 900);
  };

  const handleSocialLogin = (platform: string) => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(`${platform.toLowerCase()}-user@epma.com`);
    }, 1200);
  };

  const handleSSOLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoDomain) {
      setError('Please enter your corporate email or workspace domain key.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(`sso-employee@${ssoDomain || 'corporate.com'}`);
    }, 1500);
  };

  return (
    <div id="login-container" className="min-h-screen w-screen flex flex-col md:flex-row bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_38%),linear-gradient(180deg,#f7f6f2_0%,#f2efe8_100%)] text-neutral-900">
      
      {/* Editorial Branding Left Side Hero Panel */}
      <div className="flex-1 bg-neutral-950 text-white flex flex-col justify-between p-8 md:p-14 relative overflow-hidden">
        {/* Subtle mesh background grid details */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.08),rgba(255,255,255,0))] select-none pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:28px_28px] select-none pointer-events-none" />

        {/* Header */}
        <div className="z-10 flex items-center gap-2.5">
          <div className="px-3 py-1 bg-white text-neutral-900 rounded-full font-semibold text-sm tracking-widest">
            EPMA
          </div>
          <span className="font-medium text-neutral-200 tracking-tight text-sm">Enterprise Workspace</span>
        </div>

        {/* Hero Middle Content */}
        <div className="z-10 max-w-lg my-12 md:my-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-neutral-200 border border-white/10 mb-3 select-none">
              <Sparkles className="w-3.5 h-3.5 text-neutral-200" />
              SAML 2.0 & SSO Fed Ready
            </div>
            <h1 className="text-3xl md:text-4.5xl font-semibold tracking-tight leading-tight text-neutral-100">
              Your entire workspace. <br />
              <span className="text-neutral-300">Perfectly synced.</span>
            </h1>
          </motion.div>
          <p className="text-sm text-neutral-300 leading-relaxed max-w-sm">
            Access secure subpages, interactive database boards, and real-time smart writing editors controlled by Google Gemini 3.5 AI.
          </p>
        </div>

        {/* Footer */}
        <div className="z-10 flex items-center gap-6 text-xs text-neutral-400">
          <span>&copy; 2026 EPMA</span>
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Status</a>
        </div>
      </div>

      {/* Login Interaction Form Canvas */}
      <div className="w-full md:w-[460px] bg-white border-l border-black/5 flex flex-col justify-center px-8 py-12 md:px-14 relative overflow-y-auto">
        
        <div className="max-w-md w-full mx-auto space-y-6">
          
          {/* Header titles */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-950 tracking-tight">
              {ssoMode ? 'Login with corporate SSO' : 'Sign in to EPMA'}
            </h2>
            <p className="text-xs text-neutral-500 mt-1 leading-normal">
              {ssoMode 
                ? 'Enter your single-sign on workspace domain below.' 
                : 'Welcome back! Enter your details to view documents.'}
            </p>
          </div>

          {/* Quick Mock Credentials Assist Badge */}
          {!ssoMode && (
            <div className="p-3 bg-neutral-50 rounded-2xl border border-black/5 space-y-1 shadow-sm">
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                Quick Mock Demo Credentials
              </div>
              <div className="text-xs text-neutral-600 font-mono">
                Email: <span className="font-semibold text-neutral-900">admin@epma.com</span> <br />
                Password: <span className="font-semibold text-neutral-900">admin123</span>
              </div>
            </div>
          )}

          {/* Error alert banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 bg-red-50 border border-red-100/80 rounded-2xl text-xs text-red-700 leading-relaxed"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms switch logic */}
          {!ssoMode ? (
            /* Email & Password login Form */
            <form onSubmit={handleMockLogin} className="space-y-3.5">
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-medium text-neutral-700">Work Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@corporate.com"
                    className="w-full pl-9.5 pr-4 py-2.5 bg-neutral-50 border border-black/5 focus:border-neutral-300 rounded-2xl text-sm outline-hidden text-neutral-800 transition placeholder-neutral-400"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-700">Enter Password</label>
                  <a href="#" className="text-[11px] font-medium text-neutral-400 hover:text-neutral-900 transition">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    id="login-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (6+ chars)"
                    className="w-full pl-9.5 pr-4 py-2.5 bg-neutral-50 border border-black/5 focus:border-neutral-300 rounded-2xl text-sm outline-hidden text-neutral-800 transition placeholder-neutral-400"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                id="submit-classic-login"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-600 text-white font-medium text-sm rounded-full shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-300" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In with Email
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Single-Sign-On SAML corporate login Form */
            <form onSubmit={handleSSOLogin} className="space-y-3.5 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700">SSO Corporate Domain Name</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    id="login-sso-domain"
                    type="text"
                    value={ssoDomain}
                    onChange={(e) => setSsoDomain(e.target.value)}
                    placeholder="company.com"
                    className="w-full pl-9.5 pr-4 py-2.5 bg-neutral-50 border border-black/5 focus:border-neutral-300 rounded-2xl text-sm outline-hidden text-neutral-800 transition placeholder-neutral-400"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <button
                id="submit-sso-login"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-600 text-white font-medium text-sm rounded-full shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-300" />
                    Federating SAML session...
                  </>
                ) : (
                  <>
                    Connect SSO Provider
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Secondary SAML / classic toggle switch button */}
          <div className="pt-1 select-none">
            <button
              id="toggle-sso-mode-btn"
              onClick={() => {
                setSsoMode(!ssoMode);
                setError(null);
              }}
              className="w-full py-2 bg-neutral-100 hover:bg-neutral-150 text-neutral-600 hover:text-neutral-900 font-semibold text-xs rounded-xl border border-neutral-200/65 transition flex items-center justify-center gap-2"
            >
              <Shuffle className="w-3.5 h-3.5 text-neutral-400" />
              {ssoMode ? 'Use username & password standard instead' : 'Access via Corporate SAML / SSO'}
            </button>
          </div>

          {/* Social Logins Section separator */}
          <div className="relative flex py-1.5 items-center">
            <div className="flex-grow border-t border-neutral-200/80"></div>
            <span className="flex-shrink mx-3 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">or sign in with</span>
            <div className="flex-grow border-t border-neutral-200/80"></div>
          </div>

          {/* Social Login buttons panel (Google, Apple, Microsoft) */}
          <div className="space-y-2">
            
            {/* Google Authentication Trigger */}
            <button
              id="social-login-google"
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialLogin('Google')}
              className="w-full py-2.5 bg-white hover:bg-neutral-50/80 border border-neutral-200 rounded-xl text-neutral-700 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.1.3-1.15 2.1l2.91 2.26c1.7-1.57 2.68-3.88 2.68-6.21z"
                />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-2.91-2.26c-.72.48-1.63.78-2.67.78-2.06 0-3.81-1.39-4.43-3.25L1.01 19.33C3.01 22.12 7.15 24 12 24z" />
                <path fill="#FBBC05" d="M7.57 16.36c-.16-.48-.25-1-.25-1.53s.09-1.05.25-1.53l-3.32-2.58A11.91 11.91 0 0 0 3 14.83c0 1.95.46 3.8 1.25 5.43l3.32-2.58z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.15 0 3.01 1.88 1.01 4.67l3.32 2.58c.62-1.86 2.37-3.25 4.43-3.25z" />
              </svg>
              Sign In with Google Account
            </button>

            {/* Apple Authentication Trigger */}
            <button
              id="social-login-apple"
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialLogin('Apple')}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-950 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.92.99-3.03-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.92 1.12.09 2.26-.58 2.95-1.38z" />
              </svg>
              Sign In with Apple Secure ID
            </button>

            {/* Microsoft Authentication Trigger */}
            <button
              id="social-login-microsoft"
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialLogin('Microsoft')}
              className="w-full py-2.5 bg-white hover:bg-neutral-50/80 border border-neutral-200 rounded-xl text-neutral-700 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                <path fill="#F25022" d="M0 0h11v11H0z" />
                <path fill="#7FBA00" d="M12 0h11v11H12z" />
                <path fill="#00A4EF" d="M0 12h11v11H0z" />
                <path fill="#FFB900" d="M12 12h11v11H12z" />
              </svg>
              Sign In with Microsoft Live
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
