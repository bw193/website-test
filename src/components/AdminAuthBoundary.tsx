import React, { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ensureLanguage, getStoredAdminLang } from '../i18n';

export default function AdminAuthBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void ensureLanguage(getStoredAdminLang() || 'zh');
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
