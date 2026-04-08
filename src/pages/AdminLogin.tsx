import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Website
          </Link>
          
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-stone-900 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                BOLEN Admin
              </h2>
            </div>
            <h2 className="mt-8 text-3xl font-extrabold text-stone-900 tracking-tight">
              {t('admin.login.title')}
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              {isRegistering ? t('admin.login.subtitleRegister') : t('admin.login.subtitleLogin')}
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {registrationSuccess && !user && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700 font-medium">Registration successful!</p>
                    <p className="text-sm text-green-600 mt-1">Your account is pending approval from an administrator. You will be able to log in once approved.</p>
                  </div>
                </div>
              </div>
            )}
            {user && isPending ? (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-amber-800 font-medium">{t('admin.login.pendingTitle')}</p>
                    <p className="text-sm text-amber-700 mt-1">{t('admin.login.pendingDesc', { email: user.email })}</p>
                  </div>
                </div>
              </div>
            ) : user && !isAdmin ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-800 font-medium">{t('admin.login.deniedTitle')}</p>
                    <p className="text-sm text-red-700 mt-1">{t('admin.login.deniedDesc', { email: user.email })}</p>
                  </div>
                </div>
              </div>
            ) : null}
            
            {user ? (
              <div className="mt-6">
                <button
                  onClick={() => logout()}
                  className="w-full flex justify-center py-3 px-4 border border-stone-300 rounded-xl shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{t('admin.login.email')}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-stone-200 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all sm:text-sm bg-stone-50"
                    placeholder="admin@bolen.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{t('admin.login.password')}</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-stone-200 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all sm:text-sm bg-stone-50"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : isRegistering ? (
                    <UserPlus className="w-5 h-5 mr-2" />
                  ) : (
                    <LogIn className="w-5 h-5 mr-2" />
                  )}
                  {isRegistering ? t('admin.login.registerBtn') : t('admin.login.signInBtn')}
                </button>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-sm text-stone-500 hover:text-stone-900 font-medium transition-colors"
                  >
                    {isRegistering ? t('admin.login.alreadyHaveAccount') : t('admin.login.needAccount')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block relative w-0 flex-1 bg-stone-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          src="https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg"
          alt="Premium LED Mirrors"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h3 className="text-3xl font-bold mb-2">Manage Your Catalog</h3>
          <p className="text-stone-300 max-w-lg">
            Access the BOLEN admin portal to update products, manage customer RFQs, and oversee your global B2B operations.
          </p>
        </div>
      </div>
    </div>
  );
}
