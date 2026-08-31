import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, hasSupabaseConfig } from '../supabase';
import { useForm, Controller } from 'react-hook-form';
import { Loader2, ArrowLeft, Upload, Image as ImageIcon, FileText, Settings, Tag, Package, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import SEO from '../components/SEO';
import { toSlug } from '../utils/slug';
import { normalizeBlogCover } from '../utils/blog';
import { BLOG_LANGUAGES, type BlogLang } from '../types/blog';

const DEFAULT_CATEGORIES = ['Buying Guide', 'Technology', 'Manufacturing', 'Design'];
const LANG_LABELS: Record<BlogLang, string> = { en: 'EN', zh: '中文', es: 'ES', fr: 'FR', de: 'DE', it: 'IT' };

type LangMap = Record<BlogLang, string>;
const emptyLangMap = (): LangMap => ({ en: '', zh: '', es: '', fr: '', de: '', it: '' });

interface BlogFormValues {
  slug: string;
  status: 'draft' | 'published';
  category: string;
  author: string;
  cover_image: string;
  reading_minutes: string;
  published_at: string;
  title: LangMap;
  excerpt: LangMap;
  body: LangMap;
  seo_title: LangMap;
  seo_description: LangMap;
  product_ids: string[];
}

/** Keep only non-empty languages so JSONB stays clean. */
function pruneLangMap(map: LangMap): Record<string, string> {
  const out: Record<string, string> = {};
  (Object.keys(map) as BlogLang[]).forEach((k) => {
    const v = (map[k] || '').trim();
    if (v) out[k] = v;
  });
  return out;
}

/** Normalize a JSONB value from the DB into a complete LangMap for the form. */
function toLangMap(value: unknown): LangMap {
  const base = emptyLangMap();
  if (value && typeof value === 'object') {
    (Object.keys(base) as BlogLang[]).forEach((k) => {
      const v = (value as Record<string, unknown>)[k];
      if (typeof v === 'string') base[k] = v;
    });
  }
  return base;
}

export default function AdminBlogForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeLang, setActiveLang] = useState<BlogLang>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [allProducts, setAllProducts] = useState<{ id: string; title: string }[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const { register, control, handleSubmit, reset, watch, setValue, getValues } = useForm<BlogFormValues>({
    defaultValues: {
      slug: '',
      status: 'draft',
      category: '',
      author: 'BOLEN Editorial',
      cover_image: '',
      reading_minutes: '',
      published_at: '',
      title: emptyLangMap(),
      excerpt: emptyLangMap(),
      body: emptyLangMap(),
      seo_title: emptyLangMap(),
      seo_description: emptyLangMap(),
      product_ids: [],
    },
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          reset({
            slug: data.slug || '',
            status: (data.status as 'draft' | 'published') || 'draft',
            category: data.category || '',
            author: data.author || 'BOLEN Editorial',
            cover_image: data.cover_image || '',
            reading_minutes: data.reading_minutes != null ? String(data.reading_minutes) : '',
            published_at: data.published_at ? new Date(data.published_at).toISOString().split('T')[0] : '',
            title: toLangMap(data.title),
            excerpt: toLangMap(data.excerpt),
            body: toLangMap(data.body),
            seo_title: toLangMap(data.seo_title),
            seo_description: toLangMap(data.seo_description),
            product_ids: Array.isArray(data.product_ids) ? data.product_ids : [],
          });
        }
      } catch (e) {
        console.error('Error fetching article', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reset]);

  useEffect(() => {
    (async () => {
      try {
        const { data: prods } = await supabase
          .from('products')
          .select('id, title')
          .order('created_at', { ascending: false });
        if (prods) setAllProducts(prods as { id: string; title: string }[]);
      } catch (e) {
        console.error('Error fetching products', e);
      }
      try {
        const { data: setting } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'blog_categories')
          .maybeSingle();
        if (setting?.value) {
          const arr = JSON.parse(setting.value);
          if (Array.isArray(arr) && arr.length) setCategories(arr);
        }
      } catch {
        // table/key may not exist yet — keep defaults
      }
    })();
  }, []);

  const coverImage = watch('cover_image');
  const selectedProductIds = watch('product_ids') || [];

  const toggleProduct = (pid: string) => {
    const cur = getValues('product_ids') || [];
    setValue('product_ids', cur.includes(pid) ? cur.filter((x) => x !== pid) : [...cur, pid], { shouldDirty: true });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSupabaseConfig) {
      alert(t('admin.productForm.alerts.supabaseNotConfigured'));
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert(t('admin.blog.coverInvalidType', 'Choose a PNG, JPG, or WEBP image.'));
      e.target.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert(t('admin.blog.coverTooLarge', 'Cover images must be 8 MB or smaller.'));
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const filePath = `blog/${fileName}`;
      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '31536000', upsert: false });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setValue('cover_image', publicUrl, { shouldDirty: true });
    } catch (err: any) {
      let message = err?.message || t('admin.productForm.unknownError', 'Unknown error');
      if (message.includes('Bucket not found')) message = t('admin.productForm.alerts.bucketNotFound');
      alert(t('admin.productForm.alerts.uploadFailed', { message }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (values: BlogFormValues) => {
    const titleMap = pruneLangMap(values.title);
    const bodyMap = pruneLangMap(values.body);
    if (!titleMap.en) {
      alert(t('admin.blog.titleRequired'));
      setActiveLang('en');
      return;
    }
    if (values.status === 'published' && !bodyMap.en) {
      alert(
        t(
          'admin.blog.englishBodyRequired',
          'Add English article content before publishing.'
        )
      );
      setActiveLang('en');
      return;
    }
    const normalizedCover = normalizeBlogCover(values.cover_image);
    if (values.cover_image?.trim() && !normalizedCover) {
      alert(t('admin.blog.coverInvalidUrl', 'Enter a complete http:// or https:// image URL.'));
      return;
    }
    const slug = toSlug(values.slug.trim() || titleMap.en);
    if (!slug) {
      alert(t('admin.blog.slugRequired'));
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        slug,
        status: values.status,
        category: values.category || null,
        author: values.author?.trim() || 'BOLEN Editorial',
        cover_image: normalizedCover,
        reading_minutes: values.reading_minutes ? parseInt(values.reading_minutes, 10) || null : null,
        title: titleMap,
        excerpt: pruneLangMap(values.excerpt),
        body: bodyMap,
        seo_title: pruneLangMap(values.seo_title),
        seo_description: pruneLangMap(values.seo_description),
        product_ids: values.product_ids && values.product_ids.length ? values.product_ids : null,
        published_at: values.published_at
          ? new Date(values.published_at).toISOString()
          : values.status === 'published'
          ? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      };
      if (id) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      navigate('/admin?tab=blog');
    } catch (e: any) {
      console.error('Error saving article', e);
      alert(e?.message ? `${t('admin.blog.saveError')}\n${e.message}` : t('admin.blog.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-stone-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <SEO title={t('admin.seo.blogForm', 'Admin Journal | BOLEN Mirror')} noindex={true} />
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin?tab=blog')}
                className="p-2 -ml-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                title={t('admin.blog.backToDashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                {id ? t('admin.blog.editTitle') : t('admin.blog.newTitle')}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin?tab=blog')}
                className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-xl shadow-sm hover:bg-stone-50 transition-colors"
              >
                {t('admin.blog.cancel')}
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={saving || uploading}
                className="inline-flex items-center justify-center px-5 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {t('admin.blog.save')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasSupabaseConfig && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">{t('admin.productForm.supabaseSetupTitle')}</h4>
              <p className="mt-1 text-sm text-amber-800 leading-relaxed">{t('admin.productForm.supabaseSetupDesc')}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">
          {/* Main column */}
          <div className="flex-1 space-y-8">
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-stone-400" />
                  {t('admin.blog.contentSection')}
                </h3>
                <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-lg">
                  {BLOG_LANGUAGES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setActiveLang(code)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                        activeLang === code ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {LANG_LABELS[code]}
                      {code === 'en' ? ' *' : ''}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 space-y-6" key={activeLang}>
                <p className="text-xs text-stone-500">{t('admin.blog.requiredEn')}</p>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    {t('admin.blog.fieldTitle')} ({LANG_LABELS[activeLang]})
                  </label>
                  <input
                    type="text"
                    {...register(`title.${activeLang}`)}
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50 transition-colors"
                    placeholder={t('admin.blog.placeholderTitle', 'How to Choose an LED Bathroom Mirror')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    {t('admin.blog.fieldExcerpt')} ({LANG_LABELS[activeLang]})
                  </label>
                  <textarea
                    rows={3}
                    {...register(`excerpt.${activeLang}`)}
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50 transition-colors resize-none"
                    placeholder={t('admin.blog.placeholderExcerpt', 'One or two sentences for cards and search results.')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    {t('admin.blog.fieldBody')} ({LANG_LABELS[activeLang]})
                  </label>
                  <div className="border border-stone-200 rounded-xl overflow-hidden" data-color-mode="light">
                    <Controller
                      name={`body.${activeLang}`}
                      control={control}
                      render={({ field }) => (
                        <MDEditor
                          value={field.value || ''}
                          onChange={(v) => field.onChange(v || '')}
                          preview="edit"
                          height={460}
                          className="w-full !border-0"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEO overrides */}
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-stone-400" />
                  {t('admin.blog.seoSection')}
                </h3>
              </div>
              <div className="p-6 space-y-6" key={`seo-${activeLang}`}>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    {t('admin.blog.fieldSeoTitle')} ({LANG_LABELS[activeLang]})
                  </label>
                  <input
                    type="text"
                    {...register(`seo_title.${activeLang}`)}
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50"
                    placeholder={t('admin.blog.seoTitleHelp')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    {t('admin.blog.fieldSeoDesc')} ({LANG_LABELS[activeLang]})
                  </label>
                  <textarea
                    rows={2}
                    {...register(`seo_description.${activeLang}`)}
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50 resize-none"
                    placeholder={t('admin.blog.seoDescHelp')}
                  />
                </div>
              </div>
            </div>

            {/* Related products */}
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-stone-400" />
                  {t('admin.blog.fieldProducts', 'Related Products')}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-stone-500 mb-4">
                  {t('admin.blog.productsHelp', 'Link products mentioned in this article — they appear at the bottom of the post.')}
                </p>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={t('admin.blog.searchProducts', 'Search products...')}
                    className="block w-full pl-9 pr-3 rounded-xl border-stone-200 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50"
                  />
                </div>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-stone-200 divide-y divide-stone-100">
                  {allProducts
                    .filter((p) => p.title.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((p) => {
                      const checked = selectedProductIds.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProduct(p.id)}
                            className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                          />
                          <span className="text-sm text-stone-700 truncate">{p.title}</span>
                        </label>
                      );
                    })}
                  {allProducts.length === 0 && <p className="px-4 py-6 text-center text-sm text-stone-400">—</p>}
                </div>
                <p className="mt-2 text-xs text-stone-500">{t('admin.blog.productsSelected', { n: selectedProductIds.length })}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 flex flex-col gap-8">
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-stone-400" />
                  {t('admin.blog.metaSection')}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.blog.fieldStatus')}</label>
                  <select
                    {...register('status')}
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50"
                  >
                    <option value="draft">{t('admin.blog.draft')}</option>
                    <option value="published">{t('admin.blog.published')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.blog.fieldSlug')}</label>
                  <input
                    type="text"
                    {...register('slug')}
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50"
                    placeholder={t('admin.blog.slugPlaceholder', 'auto-from-title')}
                  />
                  <p className="mt-1.5 text-xs text-stone-500">{t('admin.blog.slugHelp')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.blog.fieldCategory')}</label>
                  <select
                    {...register('category')}
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50"
                  >
                    <option value="">—</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {t(`blog.categories.${c}`, c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.blog.fieldAuthor')}</label>
                  <input
                    type="text"
                    {...register('author')}
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.blog.fieldPublishedAt')}</label>
                    <input
                      type="date"
                      {...register('published_at')}
                      className="block w-full rounded-xl border-stone-200 py-2.5 px-3 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.blog.fieldReadingMinutes')}</label>
                    <input
                      type="number"
                      min={1}
                      {...register('reading_minutes')}
                      className="block w-full rounded-xl border-stone-200 py-2.5 px-3 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50"
                      placeholder={t('admin.blog.readingPlaceholder', 'auto')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cover image */}
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-stone-400" />
                  {t('admin.blog.fieldCover')}
                </h3>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  {t('admin.blog.coverOptionalHelp', 'Optional. Leave blank for a text-first Insight layout.')}
                </p>
              </div>
              <div className="p-6 space-y-4">
                {coverImage ? (
                  <div>
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                      <img src={coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setValue('cover_image', '', { shouldDirty: true })}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t('admin.blog.removeCover', 'Remove cover')}
                    </button>
                  </div>
                ) : null}
                <div
                  className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:bg-stone-50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleCoverUpload} />
                  <div className="mx-auto h-12 w-12 text-stone-400 bg-stone-100 rounded-full flex items-center justify-center mb-3">
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                  </div>
                  <p className="text-sm font-medium text-stone-900">
                    {uploading ? t('admin.blog.uploading') : t('admin.blog.uploadCover')}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">{t('admin.blog.coverTypes', 'PNG, JPG, WEBP')}</p>
                </div>
                <input
                  type="url"
                  {...register('cover_image')}
                  placeholder="https://…"
                  className="block w-full rounded-lg border-stone-200 py-1.5 px-2 text-xs focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-white"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
