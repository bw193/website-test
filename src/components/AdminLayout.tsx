import React, { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clapperboard,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import AdminLanguageSwitch from './admin/AdminLanguageSwitch';

const LOGO_URL =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png';

export type AdminTab = 'overview' | 'products' | 'blog' | 'videos' | 'rfqs' | 'employees' | 'settings';

export const ADMIN_TABS: AdminTab[] = [
  'overview',
  'products',
  'blog',
  'videos',
  'rfqs',
  'employees',
  'settings',
];

export function adminPath(tab: AdminTab = 'overview') {
  return tab === 'overview' ? '/admin' : `/admin?tab=${tab}`;
}

export type AdminShellContext = {
  newRfqCount: number;
  setNewRfqCount: React.Dispatch<React.SetStateAction<number>>;
};

function initialsFromEmail(email?: string | null) {
  const local = (email || '').split('@')[0] || 'B';
  return local.slice(0, 2).toUpperCase();
}

function tabFromLocation(pathname: string, search: string): AdminTab {
  if (pathname.startsWith('/admin/products')) return 'products';
  if (pathname.startsWith('/admin/blog')) return 'blog';
  if (pathname.startsWith('/admin/videos')) return 'videos';
  const tab = new URLSearchParams(search).get('tab') as AdminTab | null;
  return tab && ADMIN_TABS.includes(tab) ? tab : 'overview';
}

type NavItem = {
  tab: AdminTab;
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  adminOnly?: boolean;
};

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { user, role, isMasterAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newRfqCount, setNewRfqCount] = useState(0);

  const canManageTeam = role === 'admin' || isMasterAdmin;
  const publicLang = ['en', 'zh', 'es', 'fr', 'de', 'it'].includes(i18n.language.split('-')[0])
    ? i18n.language.split('-')[0]
    : 'en';
  const websiteHref = `/${publicLang}/`;
  const activeTab = tabFromLocation(location.pathname, location.search);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from('rfqs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new');
      if (!cancelled) setNewRfqCount(count || 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const groups = useMemo(() => {
    const content: NavItem[] = [
      {
        tab: 'overview',
        to: adminPath('overview'),
        label: t('admin.dashboard.overview', 'Overview'),
        icon: LayoutDashboard,
      },
      {
        tab: 'products',
        to: adminPath('products'),
        label: t('admin.dashboard.tabs.products'),
        icon: Package,
      },
      {
        tab: 'blog',
        to: adminPath('blog'),
        label: t('admin.blog.tab', 'Journal'),
        icon: BookOpen,
      },
      {
        tab: 'videos',
        to: adminPath('videos'),
        label: t('admin.videos.tab', 'Videos'),
        icon: Clapperboard,
      },
    ];
    const inquiries: NavItem[] = [
      {
        tab: 'rfqs',
        to: adminPath('rfqs'),
        label: t('admin.dashboard.tabs.rfqs'),
        icon: Inbox,
        badge: newRfqCount,
      },
    ];
    const admin: NavItem[] = [
      ...(canManageTeam
        ? [
            {
              tab: 'employees' as const,
              to: adminPath('employees'),
              label: t('admin.dashboard.tabs.employees'),
              icon: Users,
            },
          ]
        : []),
      {
        tab: 'settings',
        to: adminPath('settings'),
        label: t('admin.dashboard.tabs.settings', 'Settings'),
        icon: Settings,
      },
    ];
    return [
      { id: 'workspace', label: t('admin.dashboard.nav.workspace', 'Workspace'), items: content },
      { id: 'inquiries', label: t('admin.dashboard.nav.commerce', 'Inquiries'), items: inquiries },
      { id: 'admin', label: t('admin.dashboard.nav.admin', 'Admin'), items: admin },
    ];
  }, [canManageTeam, newRfqCount, t]);

  const roleLabel =
    role === 'admin' || isMasterAdmin
      ? t('admin.dashboard.roleAdmin', 'Admin')
      : t('admin.dashboard.roleEmployee', 'Employee');

  const sidebarProps = {
    groups,
    activeTab,
    email: user?.email,
    roleLabel,
    websiteHref,
    onLogout: handleLogout,
  };

  return (
    <div className="flex h-[100dvh] bg-stone-100">
      <aside className="hidden w-64 shrink-0 flex-col bg-stone-950 lg:flex">
        <SidebarPanel {...sidebarProps} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-stone-950/60"
            aria-label={t('admin.dashboard.closeMenu', 'Close menu')}
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-stone-950 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-stone-400 hover:bg-white/10 hover:text-white"
              aria-label={t('admin.dashboard.closeMenu', 'Close menu')}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarPanel {...sidebarProps} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
            aria-label={t('navbar.openMenu', 'Open main menu')}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-7 w-7 object-contain" width="28" height="28" />
            <span className="text-sm font-semibold text-stone-900">
              {t('admin.dashboard.portalName', 'Employee Portal')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-stone-500 hover:bg-red-50 hover:text-red-600"
            aria-label={t('admin.dashboard.signOut', 'Sign out')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet context={{ newRfqCount, setNewRfqCount } satisfies AdminShellContext} />
        </div>
      </div>
    </div>
  );
}

type NavGroup = { id: string; label: string; items: NavItem[] };

function SidebarPanel({
  groups,
  activeTab,
  email,
  roleLabel,
  websiteHref,
  onLogout,
}: {
  groups: NavGroup[];
  activeTab: AdminTab;
  email?: string | null;
  roleLabel: string;
  websiteHref: string;
  onLogout: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <img src={LOGO_URL} alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-0.5" width="36" height="36" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-wide text-white">BOLEN</p>
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-amber-500">
            {t('admin.dashboard.portalName', 'Employee Portal')}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label={t('admin.dashboard.portalName', 'Employee Portal')}>
        {groups.map((group) => (
          <div key={group.id} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                return (
                  <li key={item.tab}>
                    <Link
                      to={item.to}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                          : 'text-stone-400 hover:bg-white/5 hover:text-stone-100'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300'}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-stone-950">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-stone-950">
            {initialsFromEmail(email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{email}</p>
            <p className="truncate text-[11px] uppercase tracking-wider text-stone-500">{roleLabel}</p>
          </div>
        </div>
        <div className="mb-2 px-2">
          <AdminLanguageSwitch variant="dark" />
        </div>
        <Link
          to={websiteHref}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          {t('admin.dashboard.viewWebsite', 'View website')}
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          {t('admin.dashboard.signOut', 'Sign out')}
        </button>
      </div>
    </div>
  );
}
