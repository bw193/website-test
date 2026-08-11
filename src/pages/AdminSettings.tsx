import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Loader2, Save, Image as ImageIcon, Upload, Plus, Trash2, Settings as SettingsIcon, LayoutTemplate, Tags, Factory, ArrowUp, ArrowDown, AlertTriangle, Check, CircleSlash, Clock, Film, Play, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pickLocalized } from '../utils/blog';
import {
  FALLBACK_VIDEO_THUMB,
  fetchMediaSize,
  formatMediaSize,
  formatVideoDuration,
  parseFeaturedVideoSlug,
  planAmbientClip,
} from '../utils/video';
import { optimizeImage } from '../utils/optimizeImage';
import type { VideoPost } from '../types/video';

type FactoryGalleryItem = { url: string; alt: string; caption: string };

/** Published videos offered in the home "featured video" picker. */
type FeaturedVideoOption = {
  slug: string;
  title: string;
  thumbnail_url: string | null;
  category: string | null;
  duration_seconds: number | null;
  /** File size in bytes; null when it couldn't be read (embeds, network error). */
  bytes: number | null;
};

export default function AdminSettings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroBgs, setHeroBgs] = useState<string[]>(['']);
  const [categories, setCategories] = useState<string[]>([
    "New Arrival",
    "Hot Sale",
    "Led Lighted Mirror",
    "Bathroom Mirror without led",
    "Full Length Dressing Mirror",
    "Irregular Mirror"
  ]);
  const [blogCategories, setBlogCategories] = useState<string[]>([
    "Buying Guide",
    "Technology",
    "Manufacturing",
    "Design"
  ]);
  const [factoryGallery, setFactoryGallery] = useState<FactoryGalleryItem[]>([]);
  const [galleryUploading, setGalleryUploading] = useState<number | null>(null);
  const [featuredVideoSlug, setFeaturedVideoSlug] = useState<string>('');
  const [videoOptions, setVideoOptions] = useState<FeaturedVideoOption[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
    fetchVideoOptions();
  }, []);

  // The picker only offers published videos — the home section links to
  // /videos/<slug>, which 404s for drafts.
  const fetchVideoOptions = async () => {
    setVideosLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('slug, title, thumbnail_url, category, duration_seconds, published_at, video_url')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      // File size decides whether the homepage can autoplay the clip as a
      // background, so show it up front instead of letting the editor guess.
      setVideoOptions(
        await Promise.all(
          (data || []).map(async (row: Partial<VideoPost>) => ({
            slug: row.slug as string,
            title: pickLocalized(row.title, 'en') || (row.slug as string),
            thumbnail_url: row.thumbnail_url ?? null,
            category: row.category ?? null,
            duration_seconds: row.duration_seconds ?? null,
            bytes: row.video_url ? await fetchMediaSize(row.video_url) : null,
          }))
        )
      );
    } catch (err: any) {
      // A missing videos table just means the picker shows its empty state.
      console.error('Error fetching videos for featured picker:', err);
      setVideoOptions([]);
    } finally {
      setVideosLoading(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['hero_bg', 'categories', 'blog_categories', 'factory_gallery', 'home_featured_video']);

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') { // relation does not exist or not in schema cache
          setNeedsSetup(true);
        } else if (error.code !== 'PGRST116') { // not found is okay
          throw error;
        }
      } else if (data) {
        const heroBgData = data.find(d => d.key === 'hero_bg');
        if (heroBgData && heroBgData.value) {
          try {
            const parsed = JSON.parse(heroBgData.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHeroBgs(parsed);
            } else if (typeof heroBgData.value === 'string' && heroBgData.value.length > 0 && !heroBgData.value.startsWith('[')) {
              setHeroBgs([heroBgData.value]);
            }
          } catch (e) {
            if (typeof heroBgData.value === 'string' && heroBgData.value.length > 0) {
              setHeroBgs([heroBgData.value]);
            }
          }
        }

        const categoriesData = data.find(d => d.key === 'categories');
        if (categoriesData && categoriesData.value) {
          try {
            const parsed = JSON.parse(categoriesData.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCategories(parsed);
            }
          } catch (e) {
            console.error("Error parsing categories", e);
          }
        }

        const blogCategoriesData = data.find(d => d.key === 'blog_categories');
        if (blogCategoriesData && blogCategoriesData.value) {
          try {
            const parsed = JSON.parse(blogCategoriesData.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBlogCategories(parsed);
            }
          } catch (e) {
            console.error("Error parsing blog categories", e);
          }
        }

        const galleryRow = data.find(d => d.key === 'factory_gallery');
        if (galleryRow && galleryRow.value) {
          try {
            const parsed = JSON.parse(galleryRow.value);
            if (Array.isArray(parsed)) {
              setFactoryGallery(
                parsed
                  .filter((it: any) => it && typeof it.url === 'string')
                  .map((it: any) => ({
                    url: it.url || '',
                    alt: typeof it.alt === 'string' ? it.alt : '',
                    caption: typeof it.caption === 'string' ? it.caption : '',
                  }))
              );
            }
          } catch (e) {
            console.error("Error parsing factory_gallery", e);
          }
        }

        const featuredVideoRow = data.find(d => d.key === 'home_featured_video');
        setFeaturedVideoSlug(parseFeaturedVideoSlug(featuredVideoRow?.value));
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const validBgs = heroBgs.filter(bg => bg.trim() !== '');
      const validCategories = categories.filter(cat => cat.trim() !== '');
      const validBlogCategories = blogCategories.filter(cat => cat.trim() !== '');
      
      const validGallery = factoryGallery
        .filter(it => it.url.trim() !== '')
        .map(it => ({
          url: it.url.trim(),
          // Default alt is non-empty even if the editor left it blank: SEO + a11y
          // require it, and an empty alt would silently regress page audits.
          alt: it.alt.trim() || 'BOLEN mirror factory production line',
          caption: it.caption.trim(),
        }));

      const { error } = await supabase
        .from('site_settings')
        .upsert([
          { key: 'hero_bg', value: JSON.stringify(validBgs) },
          { key: 'categories', value: JSON.stringify(validCategories) },
          { key: 'blog_categories', value: JSON.stringify(validBlogCategories) },
          { key: 'factory_gallery', value: JSON.stringify(validGallery) },
          { key: 'home_featured_video', value: JSON.stringify({ slug: featuredVideoSlug.trim() }) }
        ]);

      if (error) throw error;
      alert(t('admin.dashboard.settings.saveSuccess'));
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `site-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const newBgs = [...heroBgs];
      newBgs[index] = publicUrl;
      setHeroBgs(newBgs);
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryUploading(index);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `site-assets/factory/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '31536000', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      setFactoryGallery(prev => {
        const next = [...prev];
        next[index] = { ...next[index], url: publicUrl };
        return next;
      });
    } catch (err: any) {
      console.error("Error uploading factory image:", err);
      setError(err.message);
    } finally {
      setGalleryUploading(null);
      e.target.value = '';
    }
  };

  const handleGalleryAdd = () => {
    setFactoryGallery([...factoryGallery, { url: '', alt: '', caption: '' }]);
  };

  const handleGalleryRemove = (index: number) => {
    setFactoryGallery(factoryGallery.filter((_, i) => i !== index));
  };

  const handleGalleryField = (index: number, field: keyof FactoryGalleryItem, value: string) => {
    setFactoryGallery(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleGalleryMove = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= factoryGallery.length) return;
    setFactoryGallery(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleAddBg = () => {
    setHeroBgs([...heroBgs, '']);
  };

  const handleRemoveBg = (index: number) => {
    const newBgs = [...heroBgs];
    newBgs.splice(index, 1);
    if (newBgs.length === 0) {
      newBgs.push('');
    }
    setHeroBgs(newBgs);
  };

  const handleBgChange = (index: number, value: string) => {
    const newBgs = [...heroBgs];
    newBgs[index] = value;
    setHeroBgs(newBgs);
  };

  const handleAddCategory = () => {
    setCategories([...categories, '']);
  };

  const handleRemoveCategory = (index: number) => {
    const newCats = [...categories];
    newCats.splice(index, 1);
    if (newCats.length === 0) {
      newCats.push('');
    }
    setCategories(newCats);
  };

  const handleCategoryChange = (index: number, value: string) => {
    const newCats = [...categories];
    newCats[index] = value;
    setCategories(newCats);
  };

  const handleAddBlogCategory = () => {
    setBlogCategories([...blogCategories, '']);
  };

  const handleRemoveBlogCategory = (index: number) => {
    const newCats = [...blogCategories];
    newCats.splice(index, 1);
    if (newCats.length === 0) {
      newCats.push('');
    }
    setBlogCategories(newCats);
  };

  const handleBlogCategoryChange = (index: number, value: string) => {
    const newCats = [...blogCategories];
    newCats[index] = value;
    setBlogCategories(newCats);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-stone-400" /></div>;
  }

  if (needsSetup) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-red-900">{t('admin.dashboard.settings.setupRequired')}</h3>
        </div>
        <p className="text-stone-600 mb-6 leading-relaxed">{t('admin.dashboard.settings.setupDesc')}</p>
        <pre className="bg-stone-900 text-stone-100 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed">
{`CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Allow public read access" ON site_settings;
DROP POLICY IF EXISTS "Allow admin write access" ON site_settings;

CREATE POLICY "Allow public read access" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Force schema cache reload to fix PGRST205 errors
NOTIFY pgrst, 'reload schema';`}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 font-medium transition-colors"
        >
          {t('admin.dashboard.settings.setupBtn')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Hero Backgrounds */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-stone-400" />
            {t('admin.dashboard.settings.heroBgLabel')}
          </h3>
          <button
            type="button"
            onClick={handleAddBg}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t('admin.dashboard.settings.addImage')}
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-500 mb-6">
            {t('admin.dashboard.settings.heroBgHelp')}
          </p>
          
          <div className="space-y-4">
            {heroBgs.map((bg, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex-1 w-full">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-4 w-4 text-stone-400" />
                    </div>
                    <input
                      type="text"
                      value={bg}
                      onChange={(e) => handleBgChange(index, e.target.value)}
                      placeholder={t('admin.dashboard.settings.heroBgPlaceholder')}
                      className="block w-full pl-10 rounded-xl border-stone-200 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`file-upload-${index}`}
                    onChange={(e) => handleImageUpload(e, index)}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                    disabled={uploading}
                    className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-stone-200 rounded-xl shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2 text-stone-400" />}
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveBg(index)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('admin.dashboard.settings.removeImage')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {heroBgs.some(bg => bg.trim() !== '') && (
            <div className="mt-8 pt-6 border-t border-stone-100">
              <p className="text-sm font-semibold text-stone-900 mb-4">{t('admin.dashboard.settings.preview')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroBgs.filter(bg => bg.trim() !== '').map((bg, index) => (
                  <div key={index} className="aspect-video w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative group">
                    <img src={bg} alt={`Hero Background Preview ${index + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                      Slide {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Home Featured Video — one published video highlighted on the homepage */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <Film className="h-5 w-5 text-stone-400" />
            Home Featured Video
          </h3>
          {featuredVideoSlug ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
              <Check className="h-3.5 w-3.5" />
              1 selected
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-500 text-xs font-semibold">
              Section hidden
            </span>
          )}
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-500 mb-2">
            Pick the video shown in the homepage video section. Only published videos appear here — publish a
            video under the <span className="font-medium text-stone-700">Videos</span> tab first. Choose{' '}
            <span className="font-medium text-stone-700">No video</span> to hide the section entirely, then hit
            Save Settings below.
          </p>
          <p className="text-sm text-stone-500 mb-6">
            The video autoplays silently when the section approaches the viewport. Long films loop a short excerpt;
            large files still autoplay but are flagged below so they can be optimized before publishing. Visitors
            using data saver or reduced motion keep the poster until they press play.
          </p>

          {videosLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
            </div>
          ) : videoOptions.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl text-sm text-stone-500">
              No published videos yet. Add one under the <span className="font-medium text-stone-700">Videos</span> tab,
              publish it, then come back to feature it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFeaturedVideoSlug('')}
                aria-pressed={featuredVideoSlug === ''}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm font-medium transition-colors min-h-[180px] ${
                  featuredVideoSlug === ''
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <CircleSlash className="h-6 w-6" />
                No video
                <span className={`text-xs font-normal ${featuredVideoSlug === '' ? 'text-stone-300' : 'text-stone-400'}`}>
                  Hide the section
                </span>
              </button>

              {videoOptions.map((option) => {
                const selected = option.slug === featuredVideoSlug;
                const duration = formatVideoDuration(option.duration_seconds);
                return (
                  <button
                    key={option.slug}
                    type="button"
                    onClick={() => setFeaturedVideoSlug(option.slug)}
                    aria-pressed={selected}
                    title={option.title}
                    className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                      selected
                        ? 'border-amber-500 shadow-md ring-2 ring-amber-200'
                        : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="relative aspect-video w-full bg-stone-100 overflow-hidden">
                      <img
                        src={optimizeImage(option.thumbnail_url || FALLBACK_VIDEO_THUMB, {
                          width: 480,
                          height: 270,
                          resize: 'cover',
                        })}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-stone-900/25 opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="h-8 w-8 text-white fill-current" />
                      </span>
                      {selected && (
                        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      {duration && (
                        <span className="absolute bottom-2 right-2 rounded-md bg-stone-900/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                          {duration}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-semibold text-stone-900 leading-snug">{option.title}</p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-stone-400 font-medium">
                        {option.category ? (
                          <>
                            <Film className="h-3 w-3" />
                            <span className="truncate">{option.category}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            <span className="truncate">/{option.slug}</span>
                          </>
                        )}
                      </p>
                      {option.bytes !== null && (() => {
                        const budgetPlan = planAmbientClip(option.bytes, option.duration_seconds);
                        const autoplayPlan =
                          budgetPlan ??
                          planAmbientClip(null, option.duration_seconds) ??
                          { start: 0, seconds: 0, full: true, bytes: null };
                        const isLargeFile = !budgetPlan;
                        const label = autoplayPlan.full
                          ? 'autoplays in full'
                          : `loops a ${Math.round(autoplayPlan.seconds)}s excerpt${
                              autoplayPlan.bytes ? ` (~${formatMediaSize(autoplayPlan.bytes)})` : ''
                            }`;
                        return (
                          <p
                            className={`mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${
                              isLargeFile ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {isLargeFile ? (
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                            ) : (
                              <Zap className="h-3 w-3 shrink-0" />
                            )}
                            {formatMediaSize(option.bytes)} — {label}{isLargeFile ? ' (large file)' : ''}
                          </p>
                        );
                      })()}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {featuredVideoSlug && !videosLoading && !videoOptions.some(v => v.slug === featuredVideoSlug) && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              The saved video <span className="font-mono font-semibold">{featuredVideoSlug}</span> is no longer
              published, so the homepage section is hidden. Pick another video or republish it.
            </p>
          )}
        </div>
      </div>

      {/* Factory Gallery — homepage company image showcase */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <Factory className="h-5 w-5 text-stone-400" />
            Factory Showcase Gallery
          </h3>
          <button
            type="button"
            onClick={handleGalleryAdd}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Photo
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-500 mb-6">
            Photos shown in the homepage "Inside the Factory" section. Each photo needs descriptive alt text
            (used by Google Image Search and screen readers) — keep it specific to what the image actually shows.
          </p>

          {factoryGallery.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl text-sm text-stone-500">
              No factory photos yet. Click <span className="font-medium text-stone-700">Add Photo</span> to upload your first image.
            </div>
          ) : (
            <ul className="space-y-4">
              {factoryGallery.map((item, index) => (
                <li key={index} className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="grid grid-cols-1 md:grid-cols-[140px,1fr,auto] gap-4 items-start">
                    <div className="relative w-full md:w-[140px] aspect-[4/3] rounded-lg overflow-hidden bg-stone-200 border border-stone-200">
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={item.alt || `Factory photo ${index + 1} preview`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <ImageIcon className="h-4 w-4 text-stone-400" />
                        </div>
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => handleGalleryField(index, 'url', e.target.value)}
                          placeholder="Image URL"
                          className="block w-full pl-10 rounded-xl border-stone-200 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={item.alt}
                        onChange={(e) => handleGalleryField(index, 'alt', e.target.value)}
                        placeholder="Alt text (e.g. 'BOLEN LED mirror assembly line in Jiaxing factory') — required for SEO"
                        className="block w-full rounded-xl border-stone-200 py-2 px-3 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-white"
                      />
                      <input
                        type="text"
                        value={item.caption}
                        onChange={(e) => handleGalleryField(index, 'caption', e.target.value)}
                        placeholder="Caption (optional, shown under the photo)"
                        className="block w-full rounded-xl border-stone-200 py-2 px-3 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-white"
                      />
                    </div>

                    <div className="flex md:flex-col gap-2 md:items-end">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`factory-upload-${index}`}
                        onChange={(e) => handleGalleryUpload(e, index)}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById(`factory-upload-${index}`)?.click()}
                        disabled={galleryUploading === index}
                        className="inline-flex items-center px-3 py-2 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 transition-colors disabled:opacity-50"
                      >
                        {galleryUploading === index
                          ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          : <Upload className="h-3.5 w-3.5 mr-1.5 text-stone-400" />}
                        Upload
                      </button>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleGalleryMove(index, -1)}
                          disabled={index === 0}
                          className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGalleryMove(index, 1)}
                          disabled={index === factoryGallery.length - 1}
                          className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGalleryRemove(index)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <Tags className="h-5 w-5 text-stone-400" />
            Product Categories
          </h3>
          <button
            type="button"
            onClick={handleAddCategory}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Category
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-500 mb-6">
            Manage product categories shown in the catalog and product form.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, index) => (
              <div key={index} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                <input
                  type="text"
                  value={cat}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  placeholder="Category Name"
                  className="block w-full rounded-lg border-transparent py-1.5 px-3 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-white shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(index)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Remove Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Journal Categories */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <Tags className="h-5 w-5 text-stone-400" />
            Journal Categories
          </h3>
          <button
            type="button"
            onClick={handleAddBlogCategory}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Category
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-500 mb-6">
            Manage the categories available when writing Journal articles.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogCategories.map((cat, index) => (
              <div key={index} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                <input
                  type="text"
                  value={cat}
                  onChange={(e) => handleBlogCategoryChange(index, e.target.value)}
                  placeholder="Category Name"
                  className="block w-full rounded-lg border-transparent py-1.5 px-3 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-white shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBlogCategory(index)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Remove Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? t('admin.dashboard.settings.saving') : t('admin.dashboard.settings.save')}
        </button>
      </div>
    </div>
  );
}
