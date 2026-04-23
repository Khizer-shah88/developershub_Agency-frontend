'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { getRoleRedirectPath, resolveRole } from '@/lib/auth';

const headlineWords = ['Welcome Back', "Let's Build", 'Ready to Ship', 'Start Creating'];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');

    if (!token) {
      setIsVisible(true);
      return;
    }

    let storedRole: string | undefined;
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser) as { role?: string };
        storedRole = parsed?.role;
      } catch {
        storedRole = undefined;
      }
    }

    router.replace(getRoleRedirectPath(resolveRole(storedRole, token)));
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % headlineWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
      });

      const { access_token, user } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success(`Welcome back, ${user.name}!`);
      router.replace(getRoleRedirectPath(resolveRole(user?.role, access_token)));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/auth/register', {
        name,
        email,
        password,
      });

      toast.success('Registration successful! Please sign in.');
      setIsLogin(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    setResetLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/auth/request-password-reset', {
        email: resetEmail,
      });

      toast.success(res.data?.message || 'If account exists, reset instructions were issued.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request password reset');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-10 noise-overlay">
      {/* Animated glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 -top-24 h-72 w-72 rounded-full bg-foreground/10 blur-3xl animate-float animate-pulse-glow" />
        <div className="absolute -right-20 top-24 h-80 w-80 rounded-full bg-foreground/10 blur-3xl animate-float-delayed animate-pulse-glow" />
        <div className="absolute bottom-[-8rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-foreground/5 blur-3xl animate-float-slow animate-pulse-glow" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(8)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute h-px bg-foreground/10"
              style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
            />
          ))}
          {[...Array(12)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute w-px bg-foreground/10"
              style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
            />
          ))}
        </div>
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center">
        <div
          className={`w-full relative rounded-[2rem] border border-foreground/15 bg-background/70 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-10 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight effect */}
          <div
            className="absolute inset-0 rounded-[2rem] opacity-[0.07] pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, currentColor, transparent 40%)`,
            }}
          />

          {/* Decorative corners */}
          <div className="absolute top-4 right-4 w-16 h-16 border-t border-r border-foreground/10 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b border-l border-foreground/10 rounded-bl-xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 mb-8 text-center">
            {/* Eyebrow */}
            <div
              className={`mb-6 transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="w-8 h-px bg-foreground/30" />
                <span className="font-mono text-xs tracking-[0.24em] text-muted-foreground uppercase">Developer Hub</span>
                <span className="w-8 h-px bg-foreground/30" />
              </Link>
            </div>

            {/* Animated heading */}
            <h1
              className={`font-display text-4xl sm:text-5xl tracking-tight transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {isLogin ? (
                <span className="relative inline-block">
                  <span key={wordIndex} className="inline-flex">
                    {headlineWords[wordIndex].split('').map((char, i) => (
                      <span
                        key={`${wordIndex}-${i}`}
                        className="inline-block animate-char-in"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    ))}
                  </span>
                </span>
              ) : (
                'Create Account'
              )}
            </h1>

            <p
              className={`mt-3 text-muted-foreground transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {isLogin ? 'Sign in to continue your workflow' : 'Create your account and start building'}
            </p>

            {/* Tab switcher */}
            <div
              className={`mt-6 grid grid-cols-2 rounded-full border border-foreground/15 bg-background/80 p-1 transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isLogin ? 'bg-foreground text-background shadow-lg' : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  !isLogin ? 'bg-foreground text-background shadow-lg' : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Forms */}
          <div
            className={`relative z-10 w-full grid items-start transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Login form */}
            <div
              className={`col-start-1 row-start-1 w-full transition-all duration-500 ease-in-out ${
                isLogin ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0 pointer-events-none'
              }`}
            >
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email-login" className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/70">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email-login"
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 w-full rounded-xl border border-foreground/20 bg-background/70 pl-11 pr-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 focus:bg-background/90"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password-login" className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/70">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password-login"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 w-full rounded-xl border border-foreground/20 bg-background/70 pl-11 pr-11 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 focus:bg-background/90"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-2 h-12 w-full rounded-full text-base font-medium animate-shimmer group"
                  disabled={loading}
                >
                  {loading && isLogin ? (
                    'Signing in...'
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setResetMode((prev) => !prev);
                    setResetEmail(email || resetEmail);
                  }}
                  className="w-full text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  {resetMode ? 'Hide password recovery' : 'Forgot password?'}
                </button>

                {resetMode ? (
                  <div className="space-y-3 rounded-2xl border border-foreground/15 bg-background/50 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Password Recovery</p>
                    <div className="space-y-2">
                      <input
                        type="email"
                        placeholder="Account email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="h-10 w-full rounded-xl border border-foreground/20 bg-background/70 px-3 text-sm outline-none"
                      />
                      <Button
                        type="button"
                        onClick={handleRequestReset}
                        disabled={resetLoading || !resetEmail}
                        className="h-10 w-full rounded-xl text-sm"
                      >
                        {resetLoading ? 'Requesting...' : 'Send Reset Link'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You will receive a secure reset link by email. Open that link to set a new password.
                    </p>
                  </div>
                ) : null}
              </form>
            </div>

            {/* Register form */}
            <div
              className={`col-start-1 row-start-1 w-full transition-all duration-500 ease-in-out ${
                !isLogin ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'
              }`}
            >
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name-register" className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/70">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="name-register"
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12 w-full rounded-xl border border-foreground/20 bg-background/70 pl-11 pr-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 focus:bg-background/90"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email-register" className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/70">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email-register"
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 w-full rounded-xl border border-foreground/20 bg-background/70 pl-11 pr-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 focus:bg-background/90"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password-register" className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/70">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password-register"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 w-full rounded-xl border border-foreground/20 bg-background/70 pl-11 pr-11 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 focus:bg-background/90"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-2 h-12 w-full rounded-full text-base font-medium animate-shimmer group"
                  disabled={loading}
                >
                  {loading && !isLogin ? (
                    'Creating account...'
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Social login divider */}
          <div
            className={`relative z-10 mt-8 transition-all duration-700 delay-[600ms] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-foreground/10" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">or continue with</span>
              <div className="flex-1 h-px bg-foreground/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 h-11 rounded-xl border border-foreground/15 bg-background/50 text-sm font-medium text-foreground/80 hover:bg-foreground/5 hover:border-foreground/25 transition-all duration-300"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-foreground/40 text-[10px] font-semibold leading-none">
                  GH
                </span>
                GitHub
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 h-11 rounded-xl border border-foreground/15 bg-background/50 text-sm font-medium text-foreground/80 hover:bg-foreground/5 hover:border-foreground/25 transition-all duration-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>
          </div>

          {/* Bottom link */}
          <p
            className={`relative z-10 mt-6 text-center text-sm text-muted-foreground transition-all duration-700 delay-[700ms] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Prefer the dedicated register page?{' '}
            <Link href="/register" className="font-medium text-foreground hover:underline underline-offset-4">
              Open Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
