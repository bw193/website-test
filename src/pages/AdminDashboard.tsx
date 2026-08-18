import React, { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import {
  Archive,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clapperboard,
  Edit,
  Inbox,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { captureVideoFrame, deriveEmbedThumbnail } from '../utils/videoThumbnail';
import { buildEmbedUrl, deriveVideoThumbnailUrl, FALLBACK_VIDEO_THUMB } from '../utils/video';
import { PRODUCT_IMAGE_PLACEHOLDER, handleImageError } from '../utils/imagePlaceholder';
import { ADMIN_TABS, type AdminShellContext, type AdminTab } from '../components/AdminLayout';

const PRODUCT_VIDEO_BUCKET = 'product-videos';
const AdminSettings = React.lazy(() => import('./AdminSettings'));

interface Product {
  id: string;
  title: string;
  category?: string;
  images?: unknown;
}

interface RFQ {
  id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  message: string;
  created_at: string;
  status: string;
}

interface Employee {
  id: string;
  email: string;
  role: 'admin' | 'employee' | 'pending' | 'rejected';
}

interface BlogPostRow {
  id: string;
  slug: string;
  status: string;
  category?: string | null;
  title?: Record<string, string> | null;
}

interface VideoPostRow {
  id: string;
  slug: string;
  status: string;
  source_type?: string | null;
  video_url?: string | null;
  embed_url?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  category?: string | null;
  title?: Record<string, string> | null;
}

function firstImage(images: unknown): string | null {
  if (Array.isArray(images) && typeof images[0] === 'string' && images[0]) return images[0];
  return null;
}

function greetingKey(hour: number) {
  if (hour < 12) return 'admin.dashboard.greetingMorning';
  if (hour < 18) return 'admin.dashboard.greetingAfternoon';
  return 'admin.dashboard.greetingEvening';
}

function greetingFallback(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function initialsFromEmail(email: string) {
  return (email.split('@')[0] || 'B').slice(0, 2).toUpperCase();
}

export default function AdminDashboard() {
  const { isMasterAdmin, role, user } = useAuth();
  const { t } = useTranslation();
  const { setNewRfqCount } = useOutletContext<AdminShellContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const canManageTeam = role === 'admin' || isMasterAdmin;

  const requestedTab = (searchParams.get('tab') as AdminTab | null) || 'overview';
  const activeTab: AdminTab =
    requestedTab === 'employees' && !canManageTeam
      ? 'overview'
      : ADMIN_TABS.includes(requestedTab)
        ? requestedTab
        : 'overview';

  const setActiveTab = (tab: AdminTab) => {
    setSearchParams(tab === 'overview' ? {} : { tab }, { replace: true });
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPostRow[]>([]);
  const [videoPosts, setVideoPosts] = useState<VideoPostRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [rfqStatusFilter, setRfqStatusFilter] = useState<'active' | 'new' | 'read' | 'archived' | 'all'>('all');
  const [rfqStartDate, setRfqStartDate] = useState<string>('');
  const [rfqEndDate, setRfqEndDate] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');
  const [videoSearch, setVideoSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [regeneratingVideoId, setRegeneratingVideoId] = useState<string | null>(null);
  const [regeneratingAllVideos, setRegeneratingAllVideos] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    totalRfqs: 0,
    newRfqs: 0,
    employees: 0,
    blogs: 0,
    videos: 0,
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, totalRfqRes, newRfqRes, empRes, blogRes, videoRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('rfqs').select('id', { count: 'exact', head: true }),
        supabase.from('rfqs').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        canManageTeam ? supabase.from('profiles').select('id', { count: 'exact', head: true }) : Promise.resolve({ count: 0 }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
      ]);

      const nextStats = {
        products: prodRes.count || 0,
        totalRfqs: totalRfqRes.count || 0,
        newRfqs: newRfqRes.count || 0,
        employees: empRes.count || 0,
        blogs: blogRes.count || 0,
        videos: videoRes.count || 0,
      };
      setStats(nextStats);
      setNewRfqCount(nextStats.newRfqs);

      const { data: catData } = await supabase.from('site_settings').select('value').eq('key', 'categories').single();
      if (catData && catData.value) {
        try {
          setCategories(JSON.parse(catData.value));
        } catch (e) {}
      }

      if (activeTab === 'overview') {
        const [prodData, rfqData] = await Promise.all([
          supabase.from('products').select('id, title, category, images').order('created_at', { ascending: false }).limit(6),
          supabase.from('rfqs').select('*').order('created_at', { ascending: false }).limit(5),
        ]);
        if (prodData.error) throw prodData.error;
        if (rfqData.error) throw rfqData.error;
        setProducts(prodData.data || []);
        setRfqs(rfqData.data || []);
      } else if (activeTab === 'products') {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, category, images')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } else if (activeTab === 'rfqs') {
        const { data, error } = await supabase.from('rfqs').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setRfqs(data || []);
      } else if (activeTab === 'employees' && canManageTeam) {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setEmployees(data || []);
      } else if (activeTab === 'blog') {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, slug, status, category, title')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setBlogPosts(data || []);
      } else if (activeTab === 'videos') {
        const { data, error } = await supabase
          .from('videos')
          .select('id, slug, status, source_type, video_url, embed_url, thumbnail_url, duration_seconds, category, title')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setVideoPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadVideoThumbnail = async (blob: Blob, slug: string): Promise<string> => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'video';
    const filePath = `thumbnails/regenerated-${cleanSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await supabase.storage.from(PRODUCT_VIDEO_BUCKET).upload(filePath, blob, {
      cacheControl: '31536000',
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from(PRODUCT_VIDEO_BUCKET).getPublicUrl(filePath);
    return publicUrl;
  };

  const regenerateVideoThumbnail = async (post: VideoPostRow): Promise<void> => {
    const sourceUrl = post.video_url || post.embed_url || '';
    if (!sourceUrl) throw new Error('This video has no source URL.');

    let thumbnailUrl = '';
    let durationSeconds = post.duration_seconds ?? null;

    if (post.source_type === 'embed' || buildEmbedUrl(sourceUrl)) {
      thumbnailUrl = await deriveEmbedThumbnail(sourceUrl);
      if (!thumbnailUrl) throw new Error('Could not derive a thumbnail for this embedded video.');
    } else {
      const snapshot = await captureVideoFrame(sourceUrl);
      thumbnailUrl = await uploadVideoThumbnail(snapshot.thumbnail, post.slug);
      durationSeconds = snapshot.durationSeconds ?? durationSeconds;
    }

    const updatePayload: { thumbnail_url: string; duration_seconds?: number | null } = {
      thumbnail_url: thumbnailUrl,
    };
    if (durationSeconds !== null) updatePayload.duration_seconds = durationSeconds;

    const { error } = await supabase.from('videos').update(updatePayload).eq('id', post.id);
    if (error) throw error;

    setVideoPosts((current) =>
      current.map((item) =>
        item.id === post.id ? { ...item, thumbnail_url: thumbnailUrl, duration_seconds: durationSeconds ?? item.duration_seconds } : item
      )
    );
  };

  const handleRegenerateVideoThumbnail = async (post: VideoPostRow) => {
    setRegeneratingVideoId(post.id);
    try {
      await regenerateVideoThumbnail(post);
      alert(t('admin.videos.thumbnailRegenerated', 'Thumbnail regenerated.'));
    } catch (error) {
      console.error('Error regenerating video thumbnail', error);
      alert(error instanceof Error ? error.message : t('admin.videos.thumbnailRegenerateError', 'Failed to regenerate thumbnail.'));
    } finally {
      setRegeneratingVideoId(null);
    }
  };

  const handleRegenerateAllVideoThumbnails = async () => {
    const candidates = videoPosts.filter((post) => post.video_url || post.embed_url);
    if (!candidates.length) {
      alert(t('admin.videos.noRegeneratableVideos', 'No videos with source URLs found.'));
      return;
    }
    if (
      !window.confirm(
        t(
          'admin.videos.regenerateAllConfirm',
          `Regenerate thumbnails for ${candidates.length} videos? This uploads new JPG thumbnails and updates the video records.`
        )
      )
    ) {
      return;
    }

    setRegeneratingAllVideos(true);
    let successCount = 0;
    let failureCount = 0;
    try {
      for (const post of candidates) {
        setRegeneratingVideoId(post.id);
        try {
          await regenerateVideoThumbnail(post);
          successCount += 1;
        } catch (error) {
          failureCount += 1;
          console.error(`Error regenerating thumbnail for ${post.slug}`, error);
        }
      }
      alert(
        t(
          'admin.videos.regenerateAllDone',
          `Thumbnail regeneration finished. Success: ${successCount}. Failed: ${failureCount}.`
        )
      );
    } finally {
      setRegeneratingVideoId(null);
      setRegeneratingAllVideos(false);
    }
  };

  const handleUpdateEmployeeStatus = async (id: string, nextRole: 'admin' | 'employee' | 'rejected') => {
    try {
      const { error } = await supabase.from('profiles').update({ role: nextRole }).eq('id', id);
      if (error) throw error;
      setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, role: nextRole } : emp)));
    } catch (error) {
      console.error('Error updating employee status:', error);
      alert(t('admin.dashboard.employees.updateError'));
    }
  };

  const handleUpdateRfqStatus = async (id: string, newStatus: string, currentStatus: string) => {
    try {
      const { error } = await supabase.from('rfqs').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setRfqs(rfqs.map((rfq) => (rfq.id === id ? { ...rfq, status: newStatus } : rfq)));

      if (currentStatus === 'new' && newStatus !== 'new') {
        setStats((prev) => ({ ...prev, newRfqs: prev.newRfqs - 1 }));
        setNewRfqCount((n) => Math.max(0, n - 1));
      } else if (currentStatus !== 'new' && newStatus === 'new') {
        setStats((prev) => ({ ...prev, newRfqs: prev.newRfqs + 1 }));
        setNewRfqCount((n) => n + 1);
      }
    } catch (error) {
      console.error('Error updating RFQ status:', error);
      alert('Failed to update RFQ status.');
    }
  };

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (productCategoryFilter !== 'all') {
        if (productCategoryFilter === 'uncategorized') {
          if (p.category) return false;
        } else if (p.category !== productCategoryFilter) {
          return false;
        }
      }
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, productCategoryFilter, productSearch]);

  const filteredRfqs = useMemo(() => {
    return rfqs.filter((rfq) => {
      const status = rfq.status || 'new';
      if (rfqStatusFilter === 'active') {
        if (status === 'archived') return false;
      } else if (rfqStatusFilter !== 'all' && status !== rfqStatusFilter) {
        return false;
      }

      if (rfqStartDate) {
        const rfqDate = new Date(rfq.created_at).toISOString().split('T')[0];
        if (rfqDate < rfqStartDate) return false;
      }

      if (rfqEndDate) {
        const rfqDate = new Date(rfq.created_at).toISOString().split('T')[0];
        if (rfqDate > rfqEndDate) return false;
      }
      return true;
    });
  }, [rfqs, rfqStatusFilter, rfqStartDate, rfqEndDate]);

  const filteredBlog = useMemo(() => {
    const q = blogSearch.trim().toLowerCase();
    if (!q) return blogPosts;
    return blogPosts.filter((post) => (post.title?.en || post.slug).toLowerCase().includes(q));
  }, [blogPosts, blogSearch]);

  const filteredVideos = useMemo(() => {
    const q = videoSearch.trim().toLowerCase();
    if (!q) return videoPosts;
    return videoPosts.filter((post) => (post.title?.en || post.slug).toLowerCase().includes(q));
  }, [videoPosts, videoSearch]);

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((emp) => emp.email.toLowerCase().includes(q));
  }, [employees, employeeSearch]);

  const hour = new Date().getHours();
  const firstName = (user?.email || '').split('@')[0];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SEO title="Employee Portal | BOLEN Mirror" noindex={true} />

      {loading && activeTab !== 'settings' ? (
        <DashboardSkeleton />
      ) : activeTab === 'overview' ? (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-3xl bg-stone-950 px-6 py-8 text-white sm:px-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              {t('admin.dashboard.portalName', 'Employee Portal')}
            </p>
            <h1 className="relative mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t(greetingKey(hour), greetingFallback(hour))}, {firstName}
            </h1>
            <p className="relative mt-2 max-w-xl text-sm text-stone-400">
              {t('admin.dashboard.overviewSubtitle', 'Catalog, journal, videos, and buyer RFQs in one workspace.')}
            </p>
          </div>

          <div className={`grid grid-cols-2 gap-3 ${canManageTeam ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
            <StatTile
              icon={Package}
              label={t('admin.dashboard.stats.products', 'Products')}
              value={stats.products}
              onClick={() => setActiveTab('products')}
              tone="amber"
            />
            <StatTile
              icon={Inbox}
              label={t('admin.dashboard.stats.rfqs', 'RFQs')}
              value={stats.totalRfqs}
              badge={stats.newRfqs > 0 ? t('admin.dashboard.stats.newRfqs', '{{count}} new', { count: stats.newRfqs }) : undefined}
              onClick={() => setActiveTab('rfqs')}
              tone="blue"
            />
            <StatTile
              icon={BookOpen}
              label={t('admin.dashboard.stats.blog', 'Journal')}
              value={stats.blogs}
              onClick={() => setActiveTab('blog')}
              tone="stone"
            />
            <StatTile
              icon={Clapperboard}
              label={t('admin.dashboard.stats.videos', 'Videos')}
              value={stats.videos}
              onClick={() => setActiveTab('videos')}
              tone="stone"
            />
            {canManageTeam && (
              <StatTile
                icon={Users}
                label={t('admin.dashboard.stats.team', 'Team')}
                value={stats.employees}
                onClick={() => setActiveTab('employees')}
                tone="green"
              />
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                {t('admin.dashboard.quickActions', 'Quick actions')}
              </h2>
              <div className="mt-4 grid gap-2">
                <QuickAction to="/admin/products/new" icon={Package} label={t('admin.dashboard.addProduct')} />
                <QuickAction to="/admin/blog/new" icon={BookOpen} label={t('admin.blog.addPost', 'Add journal post')} />
                <QuickAction to="/admin/videos/new" icon={Clapperboard} label={t('admin.videos.addVideo', 'Add video')} />
                <button
                  type="button"
                  onClick={() => setActiveTab('rfqs')}
                  className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-left text-sm font-medium text-stone-800 transition-colors hover:border-amber-300 hover:bg-amber-50"
                >
                  <span className="flex items-center gap-3">
                    <Inbox className="h-4 w-4 text-stone-400" />
                    {t('admin.dashboard.reviewRfqs', 'Review RFQs')}
                  </span>
                  {stats.newRfqs > 0 && (
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-stone-950">
                      {stats.newRfqs}
                    </span>
                  )}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white shadow-sm lg:col-span-3">
              <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                  {t('admin.dashboard.recentRfqs', 'Latest RFQs')}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('rfqs')}
                  className="inline-flex items-center text-xs font-semibold text-amber-700 hover:text-amber-800"
                >
                  {t('admin.dashboard.viewAll', 'View all')}
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </button>
              </div>
              <ul className="divide-y divide-stone-100">
                {rfqs.length === 0 ? (
                  <li className="px-5 py-10 text-center text-sm text-stone-500">
                    {t('admin.dashboard.rfqs.noRfqs')}
                  </li>
                ) : (
                  rfqs.map((rfq) => (
                    <li key={rfq.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900">{rfq.customer_name}</p>
                          <p className="mt-0.5 truncate text-sm text-stone-500">{rfq.product_name}</p>
                        </div>
                        <RfqStatusBadge status={rfq.status} newLabel={t('admin.dashboard.rfqs.new')} />
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                {t('admin.dashboard.recentProducts', 'Latest products')}
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="inline-flex items-center text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                {t('admin.dashboard.viewAll', 'View all')}
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </button>
            </div>
            {products.length === 0 ? (
              <EmptyState
                icon={Package}
                title={t('admin.dashboard.products.noProducts')}
                action={
                  <Link to="/admin/products/new" className="btn-primary mt-4 px-4 py-2 text-sm">
                    <Plus className="h-4 w-4" />
                    {t('admin.dashboard.addProduct')}
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} uncategorized={t('admin.dashboard.products.uncategorized')} />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : activeTab === 'products' ? (
        <SectionFrame
          title={t('admin.dashboard.tabs.products')}
          subtitle={t('admin.dashboard.section.productsHint', '{{count}} products in the catalog.', { count: stats.products })}
          action={
            <Link to="/admin/products/new" className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800">
              <Plus className="mr-2 h-4 w-4" />
              {t('admin.dashboard.addProduct')}
            </Link>
          }
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchField
              value={productSearch}
              onChange={setProductSearch}
              placeholder={t('admin.dashboard.searchProducts', 'Search products…')}
            />
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="block w-full rounded-xl border-stone-200 bg-white py-2.5 pl-3 pr-10 text-sm shadow-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 sm:w-56"
            >
              <option value="all">{t('admin.dashboard.allCategories', 'All categories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="uncategorized">{t('admin.dashboard.products.uncategorized')}</option>
            </select>
          </div>
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title={products.length === 0 ? t('admin.dashboard.products.noProducts') : t('admin.dashboard.noFilterMatch', 'No products match your filter.')}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} uncategorized={t('admin.dashboard.products.uncategorized')} />
              ))}
            </div>
          )}
        </SectionFrame>
      ) : activeTab === 'blog' ? (
        <SectionFrame
          title={t('admin.blog.tab', 'Journal')}
          subtitle={t('admin.dashboard.section.blogHint', '{{count}} posts.', { count: stats.blogs })}
          action={
            <Link to="/admin/blog/new" className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800">
              <Plus className="mr-2 h-4 w-4" />
              {t('admin.blog.addPost')}
            </Link>
          }
        >
          <div className="mb-5">
            <SearchField
              value={blogSearch}
              onChange={setBlogSearch}
              placeholder={t('admin.dashboard.searchBlog', 'Search journal posts…')}
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <ul className="divide-y divide-stone-100">
              {filteredBlog.map((post) => (
                <li key={post.id} className="transition-colors hover:bg-stone-50">
                  <Link to={`/admin/blog/${post.id}`} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-900">{post.title?.en || post.slug}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            post.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {post.status === 'published' ? t('admin.blog.published') : t('admin.blog.draft')}
                        </span>
                        {post.category && <span className="text-xs text-stone-400">{post.category}</span>}
                      </p>
                    </div>
                    <Edit className="h-4 w-4 shrink-0 text-stone-300" />
                  </Link>
                </li>
              ))}
              {filteredBlog.length === 0 && (
                <li>
                  <EmptyState icon={BookOpen} title={t('admin.blog.noPosts')} embedded />
                </li>
              )}
            </ul>
          </div>
        </SectionFrame>
      ) : activeTab === 'videos' ? (
        <SectionFrame
          title={t('admin.videos.tab', 'Videos')}
          subtitle={t('admin.dashboard.section.videosHint', '{{count}} videos.', { count: stats.videos })}
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleRegenerateAllVideoThumbnails}
                disabled={regeneratingAllVideos || videoPosts.length === 0}
                className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {regeneratingAllVideos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                {t('admin.videos.regenerateAllThumbnails', 'Regenerate thumbnails')}
              </button>
              <Link to="/admin/videos/new" className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800">
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.videos.addVideo', 'Add Video')}
              </Link>
            </div>
          }
        >
          <div className="mb-5">
            <SearchField
              value={videoSearch}
              onChange={setVideoSearch}
              placeholder={t('admin.dashboard.searchVideos', 'Search videos…')}
            />
          </div>
          {filteredVideos.length === 0 ? (
            <EmptyState
              icon={Clapperboard}
              title={t('admin.videos.noVideos', 'No videos yet. Create your first one.')}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredVideos.map((post) => (
                <div key={post.id} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative aspect-video bg-stone-100">
                    <img
                      src={deriveVideoThumbnailUrl(post) || FALLBACK_VIDEO_THUMB}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleRegenerateVideoThumbnail(post)}
                        disabled={regeneratingAllVideos || regeneratingVideoId === post.id || (!post.video_url && !post.embed_url)}
                        title={t('admin.videos.regenerateThumbnail', 'Regenerate thumbnail')}
                        className="rounded-lg bg-white/90 p-1.5 text-stone-600 shadow-sm transition-colors hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {regeneratingVideoId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-900">{post.title?.en || post.slug}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${
                            post.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {post.status === 'published' ? t('admin.blog.published') : t('admin.blog.draft')}
                        </span>
                        {post.source_type && <span className="uppercase tracking-wide text-stone-400">{post.source_type}</span>}
                        {post.category && <span>{post.category}</span>}
                      </p>
                    </div>
                    <Link
                      to={`/admin/videos/${post.id}`}
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionFrame>
      ) : activeTab === 'rfqs' ? (
        <SectionFrame
          title={t('admin.dashboard.tabs.rfqs')}
          subtitle={t('admin.dashboard.section.rfqsHint', '{{count}} inquiries · {{newCount}} unread.', { count: stats.totalRfqs, newCount: stats.newRfqs })}
        >
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                {t('admin.dashboard.statusFilter', 'Status')}
              </span>
              <select
                value={rfqStatusFilter}
                onChange={(e) => setRfqStatusFilter(e.target.value as typeof rfqStatusFilter)}
                className="block w-full rounded-xl border-stone-200 bg-stone-50 py-2 pl-3 pr-10 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="active">Active (New & Read)</option>
                <option value="new">Unread (New)</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
                <option value="all">All RFQs</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 lg:flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                {t('admin.dashboard.dateRange', 'Date range')}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={rfqStartDate}
                  onChange={(e) => setRfqStartDate(e.target.value)}
                  className="block w-full rounded-xl border-stone-200 bg-stone-50 py-2 px-3 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <span className="text-sm text-stone-400">to</span>
                <input
                  type="date"
                  value={rfqEndDate}
                  onChange={(e) => setRfqEndDate(e.target.value)}
                  className="block w-full rounded-xl border-stone-200 bg-stone-50 py-2 px-3 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                {(rfqStartDate || rfqEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRfqStartDate('');
                      setRfqEndDate('');
                    }}
                    className="rounded-lg bg-stone-100 p-2 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-900"
                    title="Clear date filter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </label>
          </div>

          <div className="space-y-4">
            {filteredRfqs.map((rfq) => (
              <article
                key={rfq.id}
                className={`rounded-2xl border p-5 shadow-sm ${
                  rfq.status === 'new'
                    ? 'border-amber-200 bg-amber-50/40'
                    : rfq.status === 'archived'
                      ? 'border-stone-200 bg-stone-50/70 opacity-80'
                      : 'border-stone-200 bg-white'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-stone-900">{rfq.customer_name}</h3>
                      <span className="hidden text-stone-300 sm:inline">·</span>
                      <span className="text-sm font-medium text-stone-600">{rfq.product_name}</span>
                    </div>
                    <p className="mt-1 text-sm text-stone-500">
                      <a href={`mailto:${rfq.customer_email}`} className="text-amber-700 hover:underline">
                        {rfq.customer_email}
                      </a>
                    </p>
                    <p className="mt-1 font-mono text-xs text-stone-400">
                      {new Date(rfq.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <RfqStatusBadge status={rfq.status} newLabel={t('admin.dashboard.rfqs.new')} />
                    {rfq.status === 'new' ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateRfqStatus(rfq.id, 'read', rfq.status)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark Read
                      </button>
                    ) : rfq.status === 'archived' ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateRfqStatus(rfq.id, 'read', rfq.status)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
                      >
                        <Inbox className="h-3.5 w-3.5" /> Unarchive
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateRfqStatus(rfq.id, 'new', rfq.status)}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
                        >
                          Mark Unread
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRfqStatus(rfq.id, 'archived', rfq.status)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Archive className="h-3.5 w-3.5" /> Archive
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 whitespace-pre-wrap rounded-xl border border-stone-200/70 bg-white p-4 text-sm leading-relaxed text-stone-700">
                  {rfq.message}
                </div>
                <a
                  href={`mailto:${rfq.customer_email}?subject=Re: RFQ for ${rfq.product_name}`}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800"
                >
                  {t('admin.dashboard.rfqs.replyEmail')}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </article>
            ))}
            {filteredRfqs.length === 0 && (
              <EmptyState
                icon={Inbox}
                title={rfqs.length === 0 ? t('admin.dashboard.rfqs.noRfqs') : t('admin.dashboard.noFilterMatch', 'No RFQs match your filters.')}
              />
            )}
          </div>
        </SectionFrame>
      ) : activeTab === 'employees' ? (
        <SectionFrame
          title={t('admin.dashboard.tabs.employees')}
          subtitle={t('admin.dashboard.section.teamHint', '{{count}} accounts.', { count: stats.employees })}
        >
          <div className="mb-5">
            <SearchField
              value={employeeSearch}
              onChange={setEmployeeSearch}
              placeholder={t('admin.dashboard.searchTeam', 'Search by email…')}
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <ul className="divide-y divide-stone-100">
              {filteredEmployees.map((employee) => (
                <li key={employee.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-amber-400">
                      {initialsFromEmail(employee.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-900">{employee.email}</p>
                      <p className="mt-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            employee.role === 'admin'
                              ? 'bg-emerald-50 text-emerald-700'
                              : employee.role === 'employee'
                                ? 'bg-sky-50 text-sky-800'
                                : employee.role === 'rejected'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {employee.role === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateEmployeeStatus(employee.id, 'employee')}
                          className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
                        >
                          Approve as Employee
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateEmployeeStatus(employee.id, 'admin')}
                          className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-900 hover:bg-stone-200"
                        >
                          Approve as Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateEmployeeStatus(employee.id, 'rejected')}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                          title={t('admin.dashboard.employees.reject')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <select
                        value={employee.role}
                        onChange={(e) => handleUpdateEmployeeStatus(employee.id, e.target.value as 'admin' | 'employee' | 'rejected')}
                        className="rounded-lg border-stone-200 bg-stone-50 py-1.5 text-sm shadow-sm focus:border-stone-900 focus:ring-stone-900"
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    )}
                  </div>
                </li>
              ))}
              {filteredEmployees.length === 0 && (
                <li>
                  <EmptyState icon={Users} title={t('admin.dashboard.employees.noEmployees')} embedded />
                </li>
              )}
            </ul>
          </div>
        </SectionFrame>
      ) : activeTab === 'settings' ? (
        <SectionFrame
          title={t('admin.dashboard.settings.title')}
          subtitle={t('admin.dashboard.section.settingsHint', 'Homepage media, categories, and featured video.')}
        >
          <React.Suspense
            fallback={
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
              </div>
            }
          >
            <AdminSettings />
          </React.Suspense>
        </SectionFrame>
      ) : null}
    </div>
  );
}

function SectionFrame({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-xl border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
      />
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  badge,
  onClick,
  tone,
  className = '',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  badge?: string;
  onClick: () => void;
  tone: 'amber' | 'blue' | 'green' | 'stone';
  className?: string;
}) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-sky-50 text-sky-700',
    green: 'bg-emerald-50 text-emerald-700',
    stone: 'bg-stone-100 text-stone-600',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md ${className}`}
    >
      <div className={`mb-3 inline-flex rounded-xl p-2.5 ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-2xl font-bold text-stone-900">{value}</p>
        {badge && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{badge}</span>
        )}
      </div>
    </button>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-800 transition-colors hover:border-amber-300 hover:bg-amber-50"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-stone-400" />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-stone-300" />
    </Link>
  );
}

function ProductCard({ product, uncategorized }: { product: Product; uncategorized: string }) {
  const src = firstImage(product.images) || PRODUCT_IMAGE_PLACEHOLDER;
  return (
    <Link
      to={`/admin/products/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[4/3] bg-stone-100">
        <img src={src} alt="" className="h-full w-full object-cover" onError={handleImageError} />
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-stone-900 group-hover:text-amber-800">{product.title}</p>
        <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-wide text-stone-400">
          {product.category || uncategorized}
        </p>
      </div>
    </Link>
  );
}

function RfqStatusBadge({ status, newLabel }: { status: string; newLabel: string }) {
  const label = status === 'new' ? newLabel : status === 'archived' ? 'Archived' : 'Read';
  const cls =
    status === 'new'
      ? 'bg-amber-100 text-amber-800'
      : status === 'archived'
        ? 'bg-stone-200 text-stone-500'
        : 'bg-sky-50 text-sky-800';
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  action,
  embedded,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action?: React.ReactNode;
  embedded?: boolean;
}) {
  return (
    <div className={`px-6 py-14 text-center ${embedded ? '' : 'rounded-2xl border border-dashed border-stone-300 bg-white'}`}>
      <Icon className="mx-auto h-10 w-10 text-stone-300" />
      <p className="mt-3 font-medium text-stone-500">{title}</p>
      {action}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-stone-200" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white ring-1 ring-stone-200" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="h-64 rounded-2xl bg-white ring-1 ring-stone-200 lg:col-span-2" />
        <div className="h-64 rounded-2xl bg-white ring-1 ring-stone-200 lg:col-span-3" />
      </div>
    </div>
  );
}
