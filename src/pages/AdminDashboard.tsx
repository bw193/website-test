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
  Mail,
  Package,
  Plus,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { captureVideoFrame, deriveEmbedThumbnail } from '../utils/videoThumbnail';
import { buildEmbedUrl, deriveVideoThumbnailUrl, FALLBACK_VIDEO_THUMB, formatVideoDuration } from '../utils/video';
import { PRODUCT_IMAGE_PLACEHOLDER, handleImageError } from '../utils/imagePlaceholder';
import { ADMIN_TABS, type AdminShellContext, type AdminTab } from '../components/AdminLayout';
import {
  EmptyState,
  FilterPills,
  PageCanvas,
  ResultMeta,
  SearchField,
  SectionHeader,
  StatusPill,
  Surface,
  Toolbar,
  adminPrimaryBtn,
  adminSecondaryBtn,
} from '../components/admin/AdminUi';

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

type RfqStatusFilter = 'active' | 'new' | 'read' | 'archived' | 'all';
type PublishFilter = 'all' | 'published' | 'draft';
type RoleFilter = 'all' | 'pending' | 'employee' | 'admin' | 'rejected';

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

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function localizedTitle(title: Record<string, string> | null | undefined, slug: string) {
  return title?.en || slug;
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
  const [rfqStatusFilter, setRfqStatusFilter] = useState<RfqStatusFilter>('active');
  const [rfqStartDate, setRfqStartDate] = useState<string>('');
  const [rfqEndDate, setRfqEndDate] = useState<string>('');
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');
  const [blogStatusFilter, setBlogStatusFilter] = useState<PublishFilter>('all');
  const [videoSearch, setVideoSearch] = useState('');
  const [videoStatusFilter, setVideoStatusFilter] = useState<PublishFilter>('all');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState<RoleFilter>('all');
  const [regeneratingVideoId, setRegeneratingVideoId] = useState<string | null>(null);
  const [regeneratingAllVideos, setRegeneratingAllVideos] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    totalRfqs: 0,
    newRfqs: 0,
    employees: 0,
    pendingEmployees: 0,
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
      const [prodRes, totalRfqRes, newRfqRes, empRes, pendingEmpRes, blogRes, videoRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('rfqs').select('id', { count: 'exact', head: true }),
        supabase.from('rfqs').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        canManageTeam ? supabase.from('profiles').select('id', { count: 'exact', head: true }) : Promise.resolve({ count: 0 }),
        canManageTeam
          ? supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'pending')
          : Promise.resolve({ count: 0 }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
      ]);

      const nextStats = {
        products: prodRes.count || 0,
        totalRfqs: totalRfqRes.count || 0,
        newRfqs: newRfqRes.count || 0,
        employees: empRes.count || 0,
        pendingEmployees: pendingEmpRes.count || 0,
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
        const [prodData, rfqData, blogData, videoData] = await Promise.all([
          supabase.from('products').select('id, title, category, images').order('created_at', { ascending: false }).limit(8),
          supabase.from('rfqs').select('*').order('created_at', { ascending: false }).limit(6),
          supabase.from('blog_posts').select('id, slug, status, category, title').order('created_at', { ascending: false }).limit(5),
          supabase
            .from('videos')
            .select('id, slug, status, source_type, video_url, embed_url, thumbnail_url, duration_seconds, category, title')
            .order('created_at', { ascending: false })
            .limit(4),
        ]);
        if (prodData.error) throw prodData.error;
        if (rfqData.error) throw rfqData.error;
        if (blogData.error) throw blogData.error;
        if (videoData.error) throw videoData.error;
        setProducts(prodData.data || []);
        setRfqs(rfqData.data || []);
        setBlogPosts(blogData.data || []);
        setVideoPosts(videoData.data || []);
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
      if (employees.find((emp) => emp.id === id)?.role === 'pending') {
        setStats((prev) => ({
          ...prev,
          pendingEmployees: Math.max(0, prev.pendingEmployees - 1),
        }));
      }
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

  useEffect(() => {
    if (activeTab !== 'rfqs') return;
    if (filteredRfqs.length === 0) {
      setSelectedRfqId(null);
      return;
    }
    setSelectedRfqId((current) =>
      current && filteredRfqs.some((rfq) => rfq.id === current) ? current : filteredRfqs[0].id
    );
  }, [activeTab, filteredRfqs]);

  const filteredBlog = useMemo(() => {
    const q = blogSearch.trim().toLowerCase();
    return blogPosts.filter((post) => {
      if (blogStatusFilter !== 'all' && post.status !== blogStatusFilter) return false;
      if (q && !(post.title?.en || post.slug).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [blogPosts, blogSearch, blogStatusFilter]);

  const filteredVideos = useMemo(() => {
    const q = videoSearch.trim().toLowerCase();
    return videoPosts.filter((post) => {
      if (videoStatusFilter !== 'all' && post.status !== videoStatusFilter) return false;
      if (q && !(post.title?.en || post.slug).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [videoPosts, videoSearch, videoStatusFilter]);

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    const rank = (roleName: Employee['role']) =>
      roleName === 'pending' ? 0 : roleName === 'admin' ? 1 : roleName === 'employee' ? 2 : 3;
    return employees
      .filter((emp) => {
        if (employeeRoleFilter !== 'all' && emp.role !== employeeRoleFilter) return false;
        if (q && !emp.email.toLowerCase().includes(q)) return false;
        return true;
      })
      .slice()
      .sort((a, b) => rank(a.role) - rank(b.role) || a.email.localeCompare(b.email));
  }, [employees, employeeSearch, employeeRoleFilter]);

  const rfqCounts = useMemo(() => {
    const counts = { all: rfqs.length, active: 0, new: 0, read: 0, archived: 0 };
    for (const rfq of rfqs) {
      const status = rfq.status || 'new';
      if (status === 'new' || status === 'read' || status === 'archived') counts[status] += 1;
      if (status !== 'archived') counts.active += 1;
    }
    return counts;
  }, [rfqs]);

  const blogCounts = useMemo(() => {
    const counts = { all: blogPosts.length, published: 0, draft: 0 };
    for (const post of blogPosts) {
      if (post.status === 'published') counts.published += 1;
      else counts.draft += 1;
    }
    return counts;
  }, [blogPosts]);

  const videoCounts = useMemo(() => {
    const counts = { all: videoPosts.length, published: 0, draft: 0 };
    for (const post of videoPosts) {
      if (post.status === 'published') counts.published += 1;
      else counts.draft += 1;
    }
    return counts;
  }, [videoPosts]);

  const employeeCounts = useMemo(() => {
    const counts = { all: employees.length, pending: 0, employee: 0, admin: 0, rejected: 0 };
    for (const emp of employees) {
      counts[emp.role] += 1;
    }
    return counts;
  }, [employees]);

  const selectedRfq = filteredRfqs.find((rfq) => rfq.id === selectedRfqId) || null;
  const hour = new Date().getHours();
  const firstName = (user?.email || '').split('@')[0];
  const uncategorized = t('admin.dashboard.products.uncategorized');

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SEO title="Employee Portal | BOLEN Mirror" noindex={true} />
      <PageCanvas>
        {loading && activeTab !== 'settings' ? (
          <DashboardSkeleton />
        ) : activeTab === 'overview' ? (
          <OverviewTab
            hour={hour}
            firstName={firstName}
            stats={stats}
            canManageTeam={canManageTeam}
            products={products}
            rfqs={rfqs}
            blogPosts={blogPosts}
            videoPosts={videoPosts}
            uncategorized={uncategorized}
            onOpenTab={setActiveTab}
          />
        ) : activeTab === 'products' ? (
          <div>
            <SectionHeader
              title={t('admin.dashboard.tabs.products')}
              subtitle={t('admin.dashboard.section.productsHint', '{{count}} products in the catalog.', { count: stats.products })}
              action={
                <Link to="/admin/products/new" className={adminPrimaryBtn}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('admin.dashboard.addProduct')}
                </Link>
              }
            />
            <Toolbar>
              <SearchField
                value={productSearch}
                onChange={setProductSearch}
                placeholder={t('admin.dashboard.searchProducts', 'Search products…')}
              />
              <FilterPills
                value={productCategoryFilter}
                onChange={setProductCategoryFilter}
                options={[
                  { id: 'all', label: t('admin.dashboard.allCategories', 'All categories'), count: products.length },
                  ...categories.map((cat) => ({
                    id: cat,
                    label: cat,
                    count: products.filter((p) => p.category === cat).length,
                  })),
                  {
                    id: 'uncategorized',
                    label: uncategorized,
                    count: products.filter((p) => !p.category).length,
                  },
                ]}
              />
              <ResultMeta shown={filteredProducts.length} total={products.length} label={t('admin.dashboard.stats.products', 'Products')} />
            </Toolbar>
            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title={products.length === 0 ? t('admin.dashboard.products.noProducts') : t('admin.dashboard.noFilterMatch')}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} uncategorized={uncategorized} />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'blog' ? (
          <div>
            <SectionHeader
              title={t('admin.blog.tab', 'Journal')}
              subtitle={t('admin.dashboard.section.blogHint', '{{count}} posts.', { count: stats.blogs })}
              action={
                <Link to="/admin/blog/new" className={adminPrimaryBtn}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('admin.blog.addPost')}
                </Link>
              }
            />
            <Toolbar>
              <SearchField
                value={blogSearch}
                onChange={setBlogSearch}
                placeholder={t('admin.dashboard.searchBlog', 'Search journal posts…')}
              />
              <FilterPills<PublishFilter>
                value={blogStatusFilter}
                onChange={setBlogStatusFilter}
                options={[
                  { id: 'all', label: t('admin.dashboard.filterAll', 'All'), count: blogCounts.all },
                  { id: 'published', label: t('admin.blog.published', 'Published'), count: blogCounts.published },
                  { id: 'draft', label: t('admin.blog.draft', 'Draft'), count: blogCounts.draft },
                ]}
              />
              <ResultMeta shown={filteredBlog.length} total={blogPosts.length} label={t('admin.dashboard.stats.blog', 'Journal')} />
            </Toolbar>
            <Surface>
              <ul>
                <li className="hidden grid-cols-[1fr_10rem_7rem_2.5rem] gap-4 border-b border-stone-100 bg-stone-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 md:grid">
                  <span>{t('admin.dashboard.colTitle', 'Title')}</span>
                  <span>{t('admin.dashboard.colCategory', 'Category')}</span>
                  <span>{t('admin.dashboard.colStatus', 'Status')}</span>
                  <span className="sr-only">{t('admin.dashboard.editItem', 'Edit')}</span>
                </li>
                {filteredBlog.map((post) => (
                  <li key={post.id} className="border-b border-stone-100 last:border-0">
                    <Link
                      to={`/admin/blog/${post.id}`}
                      className="grid items-center gap-1 px-5 py-4 transition-colors hover:bg-stone-50 md:grid-cols-[1fr_10rem_7rem_2.5rem] md:gap-4"
                    >
                      <p className="truncate font-semibold text-stone-900">{localizedTitle(post.title, post.slug)}</p>
                      <p className="text-sm text-stone-500">{post.category || uncategorized}</p>
                      <div>
                        <StatusPill tone={post.status === 'published' ? 'emerald' : 'stone'}>
                          {post.status === 'published' ? t('admin.blog.published') : t('admin.blog.draft')}
                        </StatusPill>
                      </div>
                      <Edit className="hidden h-4 w-4 justify-self-end text-stone-300 md:block" />
                    </Link>
                  </li>
                ))}
                {filteredBlog.length === 0 && (
                  <li>
                    <EmptyState icon={BookOpen} title={t('admin.blog.noPosts')} embedded />
                  </li>
                )}
              </ul>
            </Surface>
          </div>
        ) : activeTab === 'videos' ? (
          <div>
            <SectionHeader
              title={t('admin.videos.tab', 'Videos')}
              subtitle={t('admin.dashboard.section.videosHint', '{{count}} videos.', { count: stats.videos })}
              action={
                <>
                  <button
                    type="button"
                    onClick={handleRegenerateAllVideoThumbnails}
                    disabled={regeneratingAllVideos || videoPosts.length === 0}
                    className={adminSecondaryBtn}
                  >
                    {regeneratingAllVideos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    {t('admin.videos.regenerateAllThumbnails', 'Regenerate thumbnails')}
                  </button>
                  <Link to="/admin/videos/new" className={adminPrimaryBtn}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('admin.videos.addVideo', 'Add Video')}
                  </Link>
                </>
              }
            />
            <Toolbar>
              <SearchField
                value={videoSearch}
                onChange={setVideoSearch}
                placeholder={t('admin.dashboard.searchVideos', 'Search videos…')}
              />
              <FilterPills<PublishFilter>
                value={videoStatusFilter}
                onChange={setVideoStatusFilter}
                options={[
                  { id: 'all', label: t('admin.dashboard.filterAll', 'All'), count: videoCounts.all },
                  { id: 'published', label: t('admin.blog.published', 'Published'), count: videoCounts.published },
                  { id: 'draft', label: t('admin.blog.draft', 'Draft'), count: videoCounts.draft },
                ]}
              />
              <ResultMeta shown={filteredVideos.length} total={videoPosts.length} label={t('admin.dashboard.stats.videos', 'Videos')} />
            </Toolbar>
            {filteredVideos.length === 0 ? (
              <EmptyState icon={Clapperboard} title={t('admin.videos.noVideos', 'No videos yet. Create your first one.')} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredVideos.map((post) => {
                  const duration = formatVideoDuration(post.duration_seconds);
                  const busy = regeneratingAllVideos || regeneratingVideoId === post.id;
                  return (
                    <article key={post.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                      <div className="relative aspect-video bg-stone-100">
                        <img
                          src={deriveVideoThumbnailUrl(post) || FALLBACK_VIDEO_THUMB}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={handleImageError}
                        />
                        {duration && (
                          <span className="absolute bottom-2 right-2 rounded-md bg-stone-950/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                            {duration}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900">{localizedTitle(post.title, post.slug)}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusPill tone={post.status === 'published' ? 'emerald' : 'stone'}>
                              {post.status === 'published' ? t('admin.blog.published') : t('admin.blog.draft')}
                            </StatusPill>
                            {post.source_type && (
                              <span className="text-[11px] font-medium uppercase tracking-wide text-stone-400">{post.source_type}</span>
                            )}
                            {post.category && <span className="text-xs text-stone-500">{post.category}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
                          <button
                            type="button"
                            onClick={() => handleRegenerateVideoThumbnail(post)}
                            disabled={busy || (!post.video_url && !post.embed_url)}
                            className={`${adminSecondaryBtn} flex-1 py-2 text-xs`}
                          >
                            {regeneratingVideoId === post.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
                            {t('admin.videos.regenerateThumbnail', 'Cover')}
                          </button>
                          <Link to={`/admin/videos/${post.id}`} className={`${adminPrimaryBtn} flex-1 py-2 text-xs`}>
                            <Edit className="mr-1.5 h-3.5 w-3.5" />
                            {t('admin.dashboard.editItem', 'Edit')}
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'rfqs' ? (
          <div>
            <SectionHeader
              title={t('admin.dashboard.tabs.rfqs')}
              subtitle={t('admin.dashboard.section.rfqsHint', '{{count}} inquiries · {{newCount}} unread.', {
                count: stats.totalRfqs,
                newCount: stats.newRfqs,
              })}
            />
            <Toolbar>
              <FilterPills<RfqStatusFilter>
                value={rfqStatusFilter}
                onChange={setRfqStatusFilter}
                options={[
                  { id: 'active', label: t('admin.dashboard.rfqs.filterActive', 'Active'), count: rfqCounts.active },
                  { id: 'new', label: t('admin.dashboard.rfqs.filterNew', 'Unread'), count: rfqCounts.new },
                  { id: 'read', label: t('admin.dashboard.rfqs.filterRead', 'Read'), count: rfqCounts.read },
                  { id: 'archived', label: t('admin.dashboard.rfqs.filterArchived', 'Archived'), count: rfqCounts.archived },
                  { id: 'all', label: t('admin.dashboard.filterAll', 'All'), count: rfqCounts.all },
                ]}
              />
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:justify-end">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  {t('admin.dashboard.dateRange', 'Date range')}
                </span>
                <input
                  type="date"
                  value={rfqStartDate}
                  onChange={(e) => setRfqStartDate(e.target.value)}
                  className="rounded-xl border-stone-200 bg-stone-50 py-2 px-3 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <span className="text-xs text-stone-400">{t('admin.dashboard.dateTo', 'to')}</span>
                <input
                  type="date"
                  value={rfqEndDate}
                  onChange={(e) => setRfqEndDate(e.target.value)}
                  className="rounded-xl border-stone-200 bg-stone-50 py-2 px-3 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                {(rfqStartDate || rfqEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRfqStartDate('');
                      setRfqEndDate('');
                    }}
                    className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900"
                    title={t('admin.dashboard.clearDates', 'Clear dates')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Toolbar>
            {filteredRfqs.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title={rfqs.length === 0 ? t('admin.dashboard.rfqs.noRfqs') : t('admin.dashboard.noFilterMatch')}
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-start">
                <Surface className="max-h-[42vh] overflow-y-auto lg:sticky lg:top-4 lg:max-h-[calc(100dvh-13rem)]">
                  <ul className="divide-y divide-stone-100">
                    {filteredRfqs.map((rfq) => {
                      const selected = rfq.id === selectedRfqId;
                      return (
                        <li key={rfq.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedRfqId(rfq.id)}
                            className={`w-full px-4 py-3.5 text-left transition-colors ${
                              selected ? 'bg-amber-50' : 'hover:bg-stone-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate font-semibold text-stone-900">{rfq.customer_name}</p>
                              <RfqStatusBadge status={rfq.status} newLabel={t('admin.dashboard.rfqs.new')} />
                            </div>
                            <p className="mt-1 truncate text-sm text-stone-500">{rfq.product_name}</p>
                            <p className="mt-1 text-[11px] text-stone-400">{formatShortDate(rfq.created_at)}</p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </Surface>
                <Surface className="p-5 sm:p-6">
                  {selectedRfq ? (
                    <RfqDetail
                      rfq={selectedRfq}
                      onUpdateStatus={handleUpdateRfqStatus}
                    />
                  ) : (
                    <EmptyState icon={Inbox} title={t('admin.dashboard.rfqs.selectPrompt', 'Select an inquiry to read the message.')} embedded />
                  )}
                </Surface>
              </div>
            )}
          </div>
        ) : activeTab === 'employees' ? (
          <div>
            <SectionHeader
              title={t('admin.dashboard.tabs.employees')}
              subtitle={t('admin.dashboard.section.teamHint', '{{count}} accounts.', { count: stats.employees })}
            />
            {employeeCounts.pending > 0 && employeeRoleFilter === 'all' && (
              <button
                type="button"
                onClick={() => setEmployeeRoleFilter('pending')}
                className="mb-4 flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-amber-900">
                  {t('admin.dashboard.pendingApprovals', '{{count}} accounts awaiting approval', { count: employeeCounts.pending })}
                </span>
                <ChevronRight className="h-4 w-4 text-amber-700" />
              </button>
            )}
            <Toolbar>
              <SearchField
                value={employeeSearch}
                onChange={setEmployeeSearch}
                placeholder={t('admin.dashboard.searchTeam', 'Search by email…')}
              />
              <FilterPills<RoleFilter>
                value={employeeRoleFilter}
                onChange={setEmployeeRoleFilter}
                options={[
                  { id: 'all', label: t('admin.dashboard.filterAll', 'All'), count: employeeCounts.all },
                  { id: 'pending', label: t('admin.dashboard.employees.roles.pending', 'Pending'), count: employeeCounts.pending },
                  { id: 'employee', label: t('admin.dashboard.roleEmployee', 'Employee'), count: employeeCounts.employee },
                  { id: 'admin', label: t('admin.dashboard.roleAdmin', 'Admin'), count: employeeCounts.admin },
                  { id: 'rejected', label: t('admin.dashboard.employees.roles.rejected', 'Rejected'), count: employeeCounts.rejected },
                ]}
              />
              <ResultMeta shown={filteredEmployees.length} total={employees.length} label={t('admin.dashboard.stats.team', 'Team')} />
            </Toolbar>
            <Surface>
              <ul>
                <li className="hidden grid-cols-[1fr_8rem_auto] gap-4 border-b border-stone-100 bg-stone-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 md:grid">
                  <span>{t('admin.dashboard.colAccount', 'Account')}</span>
                  <span>{t('admin.dashboard.colRole', 'Role')}</span>
                  <span>{t('admin.dashboard.colActions', 'Actions')}</span>
                </li>
                {filteredEmployees.map((employee) => (
                  <li
                    key={employee.id}
                    className={`grid items-center gap-3 border-b border-stone-100 px-5 py-4 last:border-0 md:grid-cols-[1fr_8rem_auto] ${
                      employee.role === 'pending' ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-amber-400">
                        {initialsFromEmail(employee.email)}
                      </div>
                      <p className="truncate font-semibold text-stone-900">{employee.email}</p>
                    </div>
                    <div>
                      <EmployeeRoleBadge role={employee.role} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {employee.role === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateEmployeeStatus(employee.id, 'employee')}
                            className={`${adminPrimaryBtn} px-3 py-1.5 text-xs`}
                          >
                            {t('admin.dashboard.employees.approveEmployee', 'Approve as employee')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateEmployeeStatus(employee.id, 'admin')}
                            className={`${adminSecondaryBtn} px-3 py-1.5 text-xs`}
                          >
                            {t('admin.dashboard.employees.approveAdmin', 'Approve as admin')}
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
                          <option value="employee">{t('admin.dashboard.roleEmployee', 'Employee')}</option>
                          <option value="admin">{t('admin.dashboard.roleAdmin', 'Admin')}</option>
                          <option value="rejected">{t('admin.dashboard.employees.roles.rejected', 'Rejected')}</option>
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
            </Surface>
          </div>
        ) : activeTab === 'settings' ? (
          <div>
            <SectionHeader
              title={t('admin.dashboard.settings.title')}
              subtitle={t('admin.dashboard.section.settingsHint', 'Homepage media, categories, and featured video.')}
            />
            <React.Suspense
              fallback={
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
                </div>
              }
            >
              <AdminSettings />
            </React.Suspense>
          </div>
        ) : null}
      </PageCanvas>
    </div>
  );
}

function OverviewTab({
  hour,
  firstName,
  stats,
  canManageTeam,
  products,
  rfqs,
  blogPosts,
  videoPosts,
  uncategorized,
  onOpenTab,
}: {
  hour: number;
  firstName: string;
  stats: {
    products: number;
    totalRfqs: number;
    newRfqs: number;
    employees: number;
    pendingEmployees: number;
    blogs: number;
    videos: number;
  };
  canManageTeam: boolean;
  products: Product[];
  rfqs: RFQ[];
  blogPosts: BlogPostRow[];
  videoPosts: VideoPostRow[];
  uncategorized: string;
  onOpenTab: (tab: AdminTab) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            {t('admin.dashboard.portalName', 'Employee Portal')}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {t(greetingKey(hour), greetingFallback(hour))}, {firstName}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-stone-500">
            {t('admin.dashboard.overviewSubtitle', 'Catalog, journal, videos, and buyer RFQs in one workspace.')}
          </p>
        </div>
        {stats.newRfqs > 0 && (
          <button type="button" onClick={() => onOpenTab('rfqs')} className={adminPrimaryBtn}>
            <Inbox className="mr-2 h-4 w-4" />
            {t('admin.dashboard.reviewRfqs', 'Review RFQs')}
            <span className="ml-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-stone-950">{stats.newRfqs}</span>
          </button>
        )}
      </div>

      {canManageTeam && stats.pendingEmployees > 0 && (
        <button
          type="button"
          onClick={() => onOpenTab('employees')}
          className="flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left"
        >
          <span className="text-sm font-medium text-amber-900">
            {t('admin.dashboard.pendingApprovals', '{{count}} accounts awaiting approval', { count: stats.pendingEmployees })}
          </span>
          <ChevronRight className="h-4 w-4 text-amber-700" />
        </button>
      )}

      <div className={`grid grid-cols-2 gap-3 ${canManageTeam ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
        <StatTile icon={Package} label={t('admin.dashboard.stats.products', 'Products')} value={stats.products} onClick={() => onOpenTab('products')} tone="amber" />
        <StatTile
          icon={Inbox}
          label={t('admin.dashboard.stats.rfqs', 'RFQs')}
          value={stats.totalRfqs}
          badge={stats.newRfqs > 0 ? t('admin.dashboard.stats.newRfqs', '{{count}} new', { count: stats.newRfqs }) : undefined}
          onClick={() => onOpenTab('rfqs')}
          tone="blue"
        />
        <StatTile icon={BookOpen} label={t('admin.dashboard.stats.blog', 'Journal')} value={stats.blogs} onClick={() => onOpenTab('blog')} tone="stone" />
        <StatTile icon={Clapperboard} label={t('admin.dashboard.stats.videos', 'Videos')} value={stats.videos} onClick={() => onOpenTab('videos')} tone="stone" />
        {canManageTeam && (
          <StatTile icon={Users} label={t('admin.dashboard.stats.team', 'Team')} value={stats.employees} onClick={() => onOpenTab('employees')} tone="green" />
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Surface className="xl:col-span-7">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-stone-900">{t('admin.dashboard.recentRfqs', 'Latest RFQs')}</h2>
            <button type="button" onClick={() => onOpenTab('rfqs')} className="inline-flex items-center text-xs font-semibold text-amber-700 hover:text-amber-800">
              {t('admin.dashboard.viewAll', 'View all')}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="divide-y divide-stone-100">
            {rfqs.length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-stone-500">{t('admin.dashboard.rfqs.noRfqs')}</li>
            ) : (
              rfqs.map((rfq) => (
                <li key={rfq.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-900">{rfq.customer_name}</p>
                      <p className="mt-0.5 truncate text-sm text-stone-500">{rfq.product_name}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <RfqStatusBadge status={rfq.status} newLabel={t('admin.dashboard.rfqs.new')} />
                      <span className="text-[11px] text-stone-400">{formatShortDate(rfq.created_at)}</span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Surface>

        <Surface className="xl:col-span-5">
          <div className="border-b border-stone-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-stone-900">{t('admin.dashboard.quickActions', 'Quick actions')}</h2>
          </div>
          <div className="grid gap-2 p-4">
            <QuickAction to="/admin/products/new" icon={Package} label={t('admin.dashboard.addProduct')} />
            <QuickAction to="/admin/blog/new" icon={BookOpen} label={t('admin.blog.addPost', 'Add journal post')} />
            <QuickAction to="/admin/videos/new" icon={Clapperboard} label={t('admin.videos.addVideo', 'Add video')} />
            <button
              type="button"
              onClick={() => onOpenTab('rfqs')}
              className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-left text-sm font-medium text-stone-800 transition-colors hover:border-amber-300 hover:bg-amber-50"
            >
              <span className="flex items-center gap-3">
                <Inbox className="h-4 w-4 text-stone-400" />
                {t('admin.dashboard.reviewRfqs', 'Review RFQs')}
              </span>
              {stats.newRfqs > 0 ? (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-stone-950">{stats.newRfqs}</span>
              ) : (
                <ArrowRight className="h-4 w-4 text-stone-300" />
              )}
            </button>
          </div>
        </Surface>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">{t('admin.dashboard.recentProducts', 'Latest products')}</h2>
          <button type="button" onClick={() => onOpenTab('products')} className="inline-flex items-center text-xs font-semibold text-amber-700 hover:text-amber-800">
            {t('admin.dashboard.viewAll', 'View all')}
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </button>
        </div>
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t('admin.dashboard.products.noProducts')}
            action={
              <Link to="/admin/products/new" className={`${adminPrimaryBtn} mt-4`}>
                <Plus className="h-4 w-4" />
                {t('admin.dashboard.addProduct')}
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} uncategorized={uncategorized} compact />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-stone-900">{t('admin.dashboard.latestJournal', 'Latest journal')}</h2>
            <button type="button" onClick={() => onOpenTab('blog')} className="inline-flex items-center text-xs font-semibold text-amber-700 hover:text-amber-800">
              {t('admin.dashboard.viewAll', 'View all')}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="divide-y divide-stone-100">
            {blogPosts.length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-stone-500">{t('admin.blog.noPosts')}</li>
            ) : (
              blogPosts.map((post) => (
                <li key={post.id}>
                  <Link to={`/admin/blog/${post.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-stone-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">{localizedTitle(post.title, post.slug)}</p>
                      <p className="mt-0.5 text-xs text-stone-400">{post.category || uncategorized}</p>
                    </div>
                    <StatusPill tone={post.status === 'published' ? 'emerald' : 'stone'}>
                      {post.status === 'published' ? t('admin.blog.published') : t('admin.blog.draft')}
                    </StatusPill>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Surface>

        <Surface>
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-stone-900">{t('admin.dashboard.latestVideos', 'Latest videos')}</h2>
            <button type="button" onClick={() => onOpenTab('videos')} className="inline-flex items-center text-xs font-semibold text-amber-700 hover:text-amber-800">
              {t('admin.dashboard.viewAll', 'View all')}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </button>
          </div>
          {videoPosts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-stone-500">{t('admin.videos.noVideos', 'No videos yet.')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-4">
              {videoPosts.map((post) => (
                <Link key={post.id} to={`/admin/videos/${post.id}`} className="group min-w-0">
                  <div className="aspect-video overflow-hidden rounded-xl bg-stone-100">
                    <img
                      src={deriveVideoThumbnailUrl(post) || FALLBACK_VIDEO_THUMB}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                    />
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-stone-900">{localizedTitle(post.title, post.slug)}</p>
                </Link>
              ))}
            </div>
          )}
        </Surface>
      </div>
    </div>
  );
}

function RfqDetail({
  rfq,
  onUpdateStatus,
}: {
  rfq: RFQ;
  onUpdateStatus: (id: string, newStatus: string, currentStatus: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-stone-900">{rfq.customer_name}</h2>
            <RfqStatusBadge status={rfq.status} newLabel={t('admin.dashboard.rfqs.new')} />
          </div>
          <p className="mt-1 text-sm font-medium text-stone-600">{rfq.product_name}</p>
          <p className="mt-2 text-sm text-stone-500">
            <a href={`mailto:${rfq.customer_email}`} className="text-amber-700 hover:underline">
              {rfq.customer_email}
            </a>
          </p>
          <p className="mt-1 font-mono text-xs text-stone-400">{new Date(rfq.created_at).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {rfq.status === 'new' ? (
            <button type="button" onClick={() => onUpdateStatus(rfq.id, 'read', rfq.status)} className={`${adminPrimaryBtn} px-3 py-1.5 text-xs`}>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              {t('admin.dashboard.rfqs.markRead', 'Mark read')}
            </button>
          ) : rfq.status === 'archived' ? (
            <button type="button" onClick={() => onUpdateStatus(rfq.id, 'read', rfq.status)} className={`${adminSecondaryBtn} px-3 py-1.5 text-xs`}>
              <Inbox className="mr-1.5 h-3.5 w-3.5" />
              {t('admin.dashboard.rfqs.unarchive', 'Unarchive')}
            </button>
          ) : (
            <>
              <button type="button" onClick={() => onUpdateStatus(rfq.id, 'new', rfq.status)} className={`${adminSecondaryBtn} px-3 py-1.5 text-xs`}>
                {t('admin.dashboard.rfqs.markUnread', 'Mark unread')}
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(rfq.id, 'archived', rfq.status)}
                className={`${adminSecondaryBtn} px-3 py-1.5 text-xs hover:border-red-200 hover:bg-red-50 hover:text-red-700`}
              >
                <Archive className="mr-1.5 h-3.5 w-3.5" />
                {t('admin.dashboard.rfqs.archive', 'Archive')}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mt-5 whitespace-pre-wrap rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-700">
        {rfq.message}
      </div>
      <a
        href={`mailto:${rfq.customer_email}?subject=Re: RFQ for ${rfq.product_name}`}
        className={`${adminPrimaryBtn} mt-5`}
      >
        <Mail className="mr-2 h-4 w-4" />
        {t('admin.dashboard.rfqs.replyEmail')}
      </a>
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  badge?: string;
  onClick: () => void;
  tone: 'amber' | 'blue' | 'green' | 'stone';
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
      className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
    >
      <div className={`inline-flex rounded-xl p-2.5 ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">{label}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-xl font-bold tabular-nums text-stone-900">{value}</p>
          {badge && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{badge}</span>}
        </div>
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

function ProductCard({ product, uncategorized, compact }: { product: Product; uncategorized: string; compact?: boolean }) {
  const src = firstImage(product.images) || PRODUCT_IMAGE_PLACEHOLDER;
  return (
    <Link
      to={`/admin/products/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={`bg-stone-100 ${compact ? 'aspect-square' : 'aspect-[4/3]'}`}>
        <img src={src} alt="" className="h-full w-full object-cover" onError={handleImageError} />
      </div>
      <div className={compact ? 'p-3' : 'flex items-start justify-between gap-2 p-4'}>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stone-900 group-hover:text-amber-800">{product.title}</p>
          <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-wide text-stone-400">{product.category || uncategorized}</p>
        </div>
        {!compact && <Edit className="mt-0.5 h-4 w-4 shrink-0 text-stone-300 group-hover:text-stone-500" />}
      </div>
    </Link>
  );
}

function RfqStatusBadge({ status, newLabel }: { status: string; newLabel: string }) {
  const { t } = useTranslation();
  const label =
    status === 'new'
      ? newLabel
      : status === 'archived'
        ? t('admin.dashboard.rfqs.filterArchived', 'Archived')
        : t('admin.dashboard.rfqs.filterRead', 'Read');
  const tone = status === 'new' ? 'amber' : status === 'archived' ? 'stone' : 'sky';
  return <StatusPill tone={tone}>{label}</StatusPill>;
}

function EmployeeRoleBadge({ role }: { role: Employee['role'] }) {
  const { t } = useTranslation();
  const tone = role === 'admin' ? 'emerald' : role === 'employee' ? 'sky' : role === 'rejected' ? 'red' : 'amber';
  const label =
    role === 'admin'
      ? t('admin.dashboard.roleAdmin', 'Admin')
      : role === 'employee'
        ? t('admin.dashboard.roleEmployee', 'Employee')
        : role === 'rejected'
          ? t('admin.dashboard.employees.roles.rejected', 'Rejected')
          : t('admin.dashboard.employees.roles.pending', 'Pending');
  return <StatusPill tone={tone}>{label}</StatusPill>;
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-28 rounded bg-stone-200" />
        <div className="h-8 w-64 rounded-lg bg-stone-200" />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white ring-1 ring-stone-200" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="h-72 rounded-2xl bg-white ring-1 ring-stone-200 xl:col-span-7" />
        <div className="h-72 rounded-2xl bg-white ring-1 ring-stone-200 xl:col-span-5" />
      </div>
    </div>
  );
}
