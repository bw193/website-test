import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, ArrowLeft, Clock, ShieldOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const LOGO_URL =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png';

export default function AdminLogin() {
  const { user, isAdmin, isPending, loginWithEmail, registerWithEmail, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegistrationSuccess(false);
    setIsLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
        setRegistrationSuccess(true);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || t('admin.login.errors.generalError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-stone-50">
      <SEO title="Employee Portal | BOLEN Mirror" noindex={true} />

      <div className="relative flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:flex-none lg:w-[520px] lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link
            to="/en/"
            className="inline-flex items-center text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('admin.login.backToWebsite', 'Back to website')}
          </Link>

          <div className="mt-10 flex items-center gap-3">
            <img src={LOGO_URL} alt="" className="h-11 w-11 rounded-xl bg-white object-contain shadow-sm ring-1 ring-stone-200" width="44" height="44" />
            <div>
              <p className="text-lg font-semibold tracking-tight text-stone-900">BOLEN</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600">
                {t('admin.login.title')}
              </p>
            </div>
          </div>

          <h1 className="mt-8 text-3xl font-semibold tracking-tight text-stone-900">
            {isRegistering
              ? t('admin.login.registerHeading', 'Request access')
              : t('admin.login.signInHeading', 'Sign in')}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            {isRegistering ? t('admin.login.subtitleRegister') : t('admin.login.subtitleLogin')}
          </p>

          <div className="mt-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {registrationSuccess && !user && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <p className="font-medium">{t('admin.login.registerSuccessTitle', 'Registration successful')}</p>
                <p className="mt-1 text-emerald-700">
                  {t('admin.login.registerSuccessDesc', 'Your account is pending administrator approval. You can sign in once it is approved.')}
                </p>
              </div>
            )}

            {user && isPending ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">{t('admin.login.pendingTitle')}</p>
                    <p className="mt-1 text-sm text-amber-800">{t('admin.login.pendingDesc', { email: user.email })}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="mt-5 w-full rounded-xl border border-amber-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-amber-50"
                >
                  {t('admin.dashboard.signOut', 'Sign out')}
                </button>
              </div>
            ) : user && !isAdmin ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-red-100 p-2 text-red-700">
                    <ShieldOff className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900">{t('admin.login.deniedTitle')}</p>
                    <p className="mt-1 text-sm text-red-800">{t('admin.login.deniedDesc', { email: user.email })}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="mt-5 w-full rounded-xl border border-red-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-red-50"
                >
                  {t('admin.dashboard.signOut', 'Sign out')}
                </button>
              </div>
            ) : !user ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.login.email')}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                    placeholder="you@bolen.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.login.password')}</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                    placeholder="••••••••"
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || isLoading}
                  className="mt-2 flex w-full items-center justify-center rounded-xl bg-stone-900 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : isRegistering ? (
                    <UserPlus className="mr-2 h-5 w-5" />
                  ) : (
                    <LogIn className="mr-2 h-5 w-5" />
                  )}
                  {isRegistering ? t('admin.login.registerBtn') : t('admin.login.signInBtn')}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
                  >
                    {isRegistering ? t('admin.login.alreadyHaveAccount') : t('admin.login.needAccount')}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative hidden flex-1 bg-stone-950 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/10" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
            {t('admin.login.panelKicker', 'Staff workspace')}
          </p>
          <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight">
            {t('admin.login.panelTitle', 'Catalog, journal, and buyer RFQs in one place.')}
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-300">
            {t(
              'admin.login.panelDesc',
              'Update products, publish factory videos, and reply to global buyers without leaving the portal.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
