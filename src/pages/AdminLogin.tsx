import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminLogin() {
  const { user, isAdmin, isPending, login, loginWithEmail, registerWithEmail, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await login();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('Login popup closed by user');
      } else {
        setError(err.message || t('admin.login.errors.loginFailed'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || t('admin.login.errors.generalError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMasterBypass = async () => {
    setEmail('wubanglun@gmail.com');
    setPassword('12345678');
    setIsLoading(true);
    try {
      await loginWithEmail('wubanglun@gmail.com', '12345678');
    } catch (err: any) {
      setError(err.message || t('admin.login.errors.generalError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Sparkles className="h-12 w-12 text-amber-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900">
          {t('admin.login.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          {isRegistering ? t('admin.login.subtitleRegister') : t('admin.login.subtitleLogin')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {user && isPending ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">{t('admin.login.pendingTitle')} </strong>
              <span className="block sm:inline">{t('admin.login.pendingDesc', { email: user.email })}</span>
            </div>
          ) : user && !isAdmin ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">{t('admin.login.deniedTitle')} </strong>
              <span className="block sm:inline">{t('admin.login.deniedDesc', { email: user.email })}</span>
            </div>
          ) : null}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700">{t('admin.login.email')}</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">{t('admin.login.password')}</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            >
              {isRegistering ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
              {isRegistering ? t('admin.login.registerBtn') : t('admin.login.signInBtn')}
            </button>

            {!isRegistering && (
              <button
                type="button"
                onClick={handleMasterBypass}
                disabled={loading || isLoading}
                className="w-full flex justify-center py-2 px-4 border border-amber-600 rounded-md shadow-sm text-sm font-medium text-amber-600 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 mt-2"
              >
                {t('admin.login.quickLogin')}
              </button>
            )}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-stone-500">{t('admin.login.orContinueWith')}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                type="button"
                disabled={loading || isLoading}
                className="w-full flex justify-center py-2 px-4 border border-stone-300 rounded-md shadow-sm bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                {t('admin.login.googleLogin')}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-amber-600 hover:text-amber-500 font-medium"
            >
              {isRegistering ? t('admin.login.alreadyHaveAccount') : t('admin.login.needAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
