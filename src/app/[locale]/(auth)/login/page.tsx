"use client";
import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/navigation';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('Auth.Login');

  // Guard: already signed in - redirect directly to role dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      toast.success('Welcome back');
      const userRole = session.user.role;
      if (userRole === 'TOUR_GUIDE') {
        router.replace('/dashboard/guide');
      } else if (userRole === 'TOUR_OPERATOR') {
        router.replace('/dashboard/operator');
      } else if (userRole === 'OBSERVER') {
        router.replace('/dashboard/observer');
      } else if (['SUPER_ADMIN', 'OPS', 'FINANCE', 'KYC_ANALYST'].includes(userRole)) {
        router.replace('/dashboard/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center animate-fade-in">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-gray-500">{t('loadingSession')}</p>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      const errorMap: Record<string, string> = {
        ACCOUNT_NOT_FOUND: 'Account not found',
        INVALID_CREDENTIALS: 'Incorrect email or password',
        ACCOUNT_SUSPENDED: 'Account suspended. Contact support.',
      };
      toast.error(errorMap[res.error] || 'Incorrect email or password');
    } else {
      toast.success('Welcome back');
    }
  }

  return (
    <main className="flex min-h-screen bg-white">
      {/* ── Left Side: Brand & Visuals (Hidden on Mobile) ── */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-400 via-slate-900 to-slate-900 pt-32">
           <svg className="absolute left-0 top-0 h-[1000px] w-[1000px] -translate-x-1/4 -translate-y-1/4 transform stroke-indigo-500/30" fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 100, 100 m -50, 0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0" strokeWidth="1" />
           </svg>
        </div>

        <div className="relative z-10">
          <Link href="/" className="text-3xl font-black text-white tracking-widest uppercase">
            Lunavia.
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <blockquote className="space-y-6">
            <p className="text-2xl font-medium text-white leading-snug">
              {t('leftQuote')}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-indigo-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lunavia-light0/20 text-indigo-300">✓</span>
                {t('feature1')}
              </div>
              <div className="flex items-center gap-3 text-indigo-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lunavia-light0/20 text-indigo-300">✓</span>
                {t('feature2')}
              </div>
              <div className="flex items-center gap-3 text-indigo-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lunavia-light0/20 text-indigo-300">✓</span>
                {t('feature3')}
              </div>
            </div>
          </blockquote>
        </div>
      </div>

      {/* ── Right Side: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-sm animate-fade-in mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link href="/" className="text-3xl font-black text-[#5BA4CF] tracking-widest uppercase">
              Lunavia.
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
            <p className="mt-2 text-sm text-gray-500">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Google OAuth Placeholder (To be wired up later) */}
            <button
              type="button"
              onClick={() => toast.error("Google Login is coming soon! Please use email/password.")}
              className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors mb-6 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('googleBtn')}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">{t('orEmail')}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#5BA4CF] hover:text-[#5BA4CF]">{t('forgotPassword')}</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gray-900 px-4 py-3.5 font-semibold text-white hover:bg-black disabled:opacity-50 transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {loading ? t('loading') : t('submit')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            {t('noAccount')}{' '}
            <Link href="/signup" className="font-semibold text-gray-900 hover:underline">
              {t('signupLink')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
