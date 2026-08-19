import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Clapperboard,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Settings,
  Tag,
  Upload,
  Wand2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import * as tus from 'tus-js-client';
import SEO from '../components/SEO';
import { supabase, hasSupabaseConfig } from '../supabase';
import { supabaseConfig } from '../supabaseConfig';
import type { VideoSourceType } from '../types/video';
import { buildEmbedUrl, youtubePosterUrl } from '../utils/video';
import { captureVideoFrame, deriveEmbedThumbnail, isDerivedEmbedThumbnail } from '../utils/videoThumbnail';
import { toSlug } from '../utils/slug';

const DEFAULT_VIDEO_CATEGORIES = ['Product Demo', 'Factory Tour', 'Installation', 'Technology', 'Quality Control'];
const PRODUCT_VIDEO_BUCKET = 'product-videos';
const TARGET_UPLOAD_LIMIT_BYTES = 500 * 1024 * 1024;
const FREE_PLAN_LIMIT_BYTES = 50 * 1024 * 1024;
const RESUMABLE_THRESHOLD_BYTES = 6 * 1024 * 1024;
const RESUMABLE_CHUNK_BYTES = 6 * 1024 * 1024;

interface VideoFormValues {
  title: string;
  excerpt: string;
  body: string;
  slug: string;
  status: 'draft' | 'published';
  source_type: VideoSourceType;
  video_url: string;
  embed_url: string;
  thumbnail_url: string;
  category: string;
  tags: string;
  duration_seconds: string;
}

interface StoredVideo {
  title?: Record<string, string> | null;
  excerpt?: Record<string, string> | null;
  body?: Record<string, string> | null;
  seo_title?: Record<string, string> | null;
  seo_description?: Record<string, string> | null;
  published_at?: string | null;
}

function splitTags(value: string): string[] | null {
  const tags = value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.length ? tags : null;
}

function getEnglish(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const english = (value as Record<string, unknown>).en;
  return typeof english === 'string' ? english : '';
}

function mergeEnglish(existing: StoredVideo[keyof StoredVideo], value: string): Record<string, string> {
  const next = existing && typeof existing === 'object' ? { ...(existing as Record<string, string>) } : {};
  const clean = value.trim();
  if (clean) {
    next.en = clean;
  } else {
    delete next.en;
  }
  return next;
}

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 100 * 1024 * 1024 ? 0 : 1)}MB`;
}

function formatUploadError(error: unknown, t: TFunction): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (/413|content too large|maximum size exceeded/i.test(message)) {
    return new Error(
      t(
        'admin.videos.uploadRejected',
        'Supabase rejected this file as larger than the active upload limit. Your product-videos bucket may be 500MB, but Storage > Settings > Global file size limit can still be 50MB and takes precedence. Set the global Storage file size limit above this video size, then try again.'
      )
    );
  }
  return error instanceof Error ? error : new Error(message);
}

export default function AdminVideoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [categories, setCategories] = useState<string[]>(DEFAULT_VIDEO_CATEGORIES);
  const [storedVideo, setStoredVideo] = useState<StoredVideo | null>(null);

  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm<VideoFormValues>({
    defaultValues: {
      title: '',
      excerpt: '',
      body: '',
      slug: '',
      status: 'draft',
      source_type: 'upload',
      video_url: '',
      embed_url: '',
      thumbnail_url: '',
      category: '',
      tags: '',
      duration_seconds: '',
    },
  });

  const sourceType = watch('source_type');
  const videoUrl = watch('video_url');
  const thumbUrl = watch('thumbnail_url');
  const durationSeconds = watch('duration_seconds');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error } = await supabase.from('videos').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          setStoredVideo(data as StoredVideo);
          reset({
            title: getEnglish(data.title),
            excerpt: getEnglish(data.excerpt),
            body: getEnglish(data.body),
            slug: data.slug || '',
            status: (data.status as 'draft' | 'published') || 'draft',
            source_type: (data.source_type as VideoSourceType) || 'upload',
            video_url: data.video_url || '',
            embed_url: data.embed_url || '',
            thumbnail_url: data.thumbnail_url || '',
            category: data.category || '',
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
            duration_seconds: data.duration_seconds != null ? String(data.duration_seconds) : '',
          });
        }
      } catch (e) {
        console.error('Error fetching video', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reset]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'video_categories')
          .maybeSingle();
        if (data?.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length) setCategories(parsed);
        }
      } catch {
        // Keep default categories.
      }
    })();
  }, []);

  useEffect(() => {
    const url = videoUrl.trim();
    const embedUrl = buildEmbedUrl(url);
    if (!embedUrl) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      if (getValues('source_type') !== 'embed') {
        setValue('source_type', 'embed', { shouldDirty: true });
      }
      if (getValues('embed_url') !== embedUrl) {
        setValue('embed_url', embedUrl, { shouldDirty: true });
      }

      const currentThumb = getValues('thumbnail_url');
      if (currentThumb && !isDerivedEmbedThumbnail(currentThumb)) return;

      const instantThumb = youtubePosterUrl(url);
      if (instantThumb && currentThumb !== instantThumb) {
        setValue('thumbnail_url', instantThumb, { shouldDirty: true });
      }

      const thumbnail = await deriveEmbedThumbnail(url);
      if (!active || !thumbnail) return;
      const latestThumb = getValues('thumbnail_url');
      if (latestThumb && !isDerivedEmbedThumbnail(latestThumb)) return;
      if (latestThumb !== thumbnail) setValue('thumbnail_url', thumbnail, { shouldDirty: true });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [sourceType, videoUrl, getValues, setValue]);

  const uploadBlobToBucket = async (blob: Blob, folder: string, extension: string): Promise<string> => {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${extension}`;
    const filePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage
      .from(PRODUCT_VIDEO_BUCKET)
      .upload(filePath, blob, {
        cacheControl: '31536000',
        contentType: blob.type || (extension === 'jpg' ? 'image/jpeg' : undefined),
        upsert: false,
      });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from(PRODUCT_VIDEO_BUCKET).getPublicUrl(filePath);
    return publicUrl;
  };

  const uploadVideoFile = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const filePath = `videos/${fileName}`;

    if (file.size <= RESUMABLE_THRESHOLD_BYTES) {
      return uploadBlobToBucket(file, 'videos', ext);
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error(t('admin.videos.signInToUpload', 'Please sign in again before uploading large videos.'));
    }

    const projectRef = new URL(supabaseConfig.url).hostname.split('.')[0];
    const endpoint = `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`;

    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        chunkSize: RESUMABLE_CHUNK_BYTES,
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        headers: {
          authorization: `Bearer ${session.access_token}`,
          apikey: supabaseConfig.anonKey,
          'x-upsert': 'false',
        },
        metadata: {
          bucketName: PRODUCT_VIDEO_BUCKET,
          objectName: filePath,
          contentType: file.type || 'video/mp4',
          cacheControl: '31536000',
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          setUploadProgress(bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : null);
        },
        onError: (error) => reject(formatUploadError(error, t)),
        onSuccess: () => resolve(),
      });

      upload.findPreviousUploads()
        .then((previousUploads) => {
          if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);
          upload.start();
        })
        .catch(reject);
    });

    const {
      data: { publicUrl },
    } = supabase.storage.from(PRODUCT_VIDEO_BUCKET).getPublicUrl(filePath);
    return publicUrl;
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSupabaseConfig) {
      alert(t('admin.productForm.alerts.supabaseNotConfigured'));
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > TARGET_UPLOAD_LIMIT_BYTES) {
      alert(t('admin.videos.uploadTooLarge', 'This video is larger than the 1GB product video bucket limit.'));
      return;
    }

    setUploadingVideo(true);
    setUploadProgress(null);
    try {
      const snapshot = await captureVideoFrame(file);
      const [videoPublicUrl, thumbnailPublicUrl] = await Promise.all([
        uploadVideoFile(file),
        uploadBlobToBucket(snapshot.thumbnail, 'thumbnails', 'jpg'),
      ]);

      setValue('source_type', 'upload', { shouldDirty: true });
      setValue('video_url', videoPublicUrl, { shouldDirty: true });
      setValue('embed_url', '', { shouldDirty: true });
      setValue('thumbnail_url', thumbnailPublicUrl, { shouldDirty: true });
      if (snapshot.durationSeconds) {
        setValue('duration_seconds', String(snapshot.durationSeconds), { shouldDirty: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('admin.videos.uploadError', 'Failed to upload video.');
      alert(`${t('admin.videos.uploadError', 'Failed to upload video.')}\n${message}`);
    } finally {
      setUploadingVideo(false);
      setUploadProgress(null);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleGenerateCoverFromUrl = async () => {
    const url = getValues('video_url').trim();
    if (!url) {
      alert(t('admin.videos.videoUrlRequired', 'A video URL is required for this source type.'));
      return;
    }

    setGeneratingCover(true);
    try {
      const embedUrl = buildEmbedUrl(url);
      if (embedUrl) {
        setValue('source_type', 'embed', { shouldDirty: true });
        setValue('embed_url', embedUrl, { shouldDirty: true });
        const thumbnail = await deriveEmbedThumbnail(url);
        if (!thumbnail) throw new Error(t('admin.videos.thumbnailDeriveError', 'Could not derive a thumbnail for this embedded video.'));
        setValue('thumbnail_url', thumbnail, { shouldDirty: true });
        return;
      }
      if (!hasSupabaseConfig) {
        alert(t('admin.productForm.alerts.supabaseNotConfigured'));
        return;
      }

      const snapshot = await captureVideoFrame(url);
      const thumbnailPublicUrl = await uploadBlobToBucket(snapshot.thumbnail, 'thumbnails', 'jpg');
      setValue('thumbnail_url', thumbnailPublicUrl, { shouldDirty: true });
      if (snapshot.durationSeconds) {
        setValue('duration_seconds', String(snapshot.durationSeconds), { shouldDirty: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('admin.videos.coverUnavailable', 'Could not generate a cover from this URL.');
      alert(`${t('admin.videos.coverUnavailable', 'Could not generate a cover from this URL.')}\n${message}`);
    } finally {
      setGeneratingCover(false);
    }
  };

  const onSubmit = async (values: VideoFormValues) => {
    const cleanTitle = values.title.trim();
    if (!cleanTitle) {
      alert(t('admin.videos.titleRequired', 'An English title is required.'));
      return;
    }

    const slug = toSlug(values.slug.trim() || cleanTitle);
    if (!slug) {
      alert(t('admin.blog.slugRequired'));
      return;
    }

    const trimmedVideoUrl = values.video_url.trim();
    if (!trimmedVideoUrl) {
      alert(t('admin.videos.videoUrlRequired', 'A video URL is required for this source type.'));
      return;
    }

    const embedFromUrl = buildEmbedUrl(trimmedVideoUrl);
    const sourceTypeToSave = embedFromUrl ? 'embed' : values.source_type;
    const derivedEmbedUrl = sourceTypeToSave === 'embed'
      ? values.embed_url.trim() || embedFromUrl
      : '';
    if (sourceTypeToSave === 'embed' && !derivedEmbedUrl) {
      alert(t('admin.videos.embedUrlRequired', 'A supported embed URL is required.'));
      return;
    }

    setSaving(true);
    try {
      let thumbnailUrl = values.thumbnail_url.trim();
      if (!thumbnailUrl && (sourceTypeToSave === 'embed' || embedFromUrl)) {
        thumbnailUrl = await deriveEmbedThumbnail(trimmedVideoUrl);
      }

      const payload: Record<string, unknown> = {
        slug,
        status: values.status,
        source_type: sourceTypeToSave,
        video_url: trimmedVideoUrl,
        embed_url: derivedEmbedUrl || null,
        thumbnail_url: thumbnailUrl || null,
        category: values.category || null,
        tags: splitTags(values.tags),
        duration_seconds: values.duration_seconds ? parseInt(values.duration_seconds, 10) || null : null,
        title: mergeEnglish(storedVideo?.title, cleanTitle),
        excerpt: mergeEnglish(storedVideo?.excerpt, values.excerpt),
        body: mergeEnglish(storedVideo?.body, values.body),
        seo_title: storedVideo?.seo_title || {},
        seo_description: storedVideo?.seo_description || {},
        published_at: values.status === 'published'
          ? storedVideo?.published_at || new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase.from('videos').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('videos').insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      navigate('/admin?tab=videos');
    } catch (err: unknown) {
      console.error('Error saving video', err);
      const message = err instanceof Error ? err.message : '';
      alert(message ? `${t('admin.videos.saveError', 'Failed to save the video.')}\n${message}` : t('admin.videos.saveError', 'Failed to save the video.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-stone-900" />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <SEO title={t('admin.seo.videoForm', 'Admin Videos | BOLEN Mirror')} noindex={true} />
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin?tab=videos')}
                className="-ml-2 rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900"
                title={t('admin.blog.backToDashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                {id ? t('admin.videos.editTitle', 'Edit Video') : t('admin.videos.newTitle', 'New Video')}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin?tab=videos')}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
              >
                {t('admin.blog.cancel')}
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={saving || uploadingVideo || generatingCover}
                className="inline-flex items-center justify-center rounded-xl border border-transparent bg-stone-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('admin.videos.save', 'Save Video')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {!hasSupabaseConfig && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="shrink-0 rounded-lg bg-amber-100 p-2 text-amber-600">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">{t('admin.productForm.supabaseSetupTitle')}</h4>
              <p className="mt-1 text-sm leading-relaxed text-amber-800">{t('admin.productForm.supabaseSetupDesc')}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-5">
              <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900">
                <Clapperboard className="h-4 w-4 text-stone-400" />
                {t('admin.videos.contentSection', 'Video Content')}
              </h3>
            </div>
            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.blog.fieldTitle')}</label>
                <input
                  type="text"
                  {...register('title')}
                  className="block w-full rounded-xl border-stone-200 bg-stone-50 px-4 py-2.5 text-stone-900 transition-colors focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  placeholder={t('admin.videos.placeholderTitle', 'Anti-fog LED bathroom mirror demo')}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.blog.fieldExcerpt')}</label>
                <textarea
                  rows={3}
                  {...register('excerpt')}
                  className="block w-full resize-none rounded-xl border-stone-200 bg-stone-50 px-4 py-2.5 text-stone-900 transition-colors focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  placeholder={t('admin.videos.placeholderExcerpt', 'Short summary for cards and search results.')}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.blog.fieldBody')}</label>
                <textarea
                  rows={5}
                  {...register('body')}
                  className="block w-full resize-y rounded-xl border-stone-200 bg-stone-50 px-4 py-2.5 text-stone-900 transition-colors focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  placeholder={t('admin.videos.placeholderBody', 'Optional notes shown on the video page.')}
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-5">
              <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900">
                <LinkIcon className="h-4 w-4 text-stone-400" />
                {t('admin.videos.sourceSection', 'Video Source')}
              </h3>
            </div>
            <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <input type="hidden" {...register('embed_url')} />
                <input type="hidden" {...register('thumbnail_url')} />
                <input type="hidden" {...register('duration_seconds')} />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.videos.sourceType', 'Source Type')}</label>
                  <select
                    {...register('source_type')}
                    className="block w-full rounded-xl border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="upload">{t('admin.videos.sourceUpload', 'Supabase upload')}</option>
                    <option value="embed">{t('admin.videos.sourceEmbed', 'External embed')}</option>
                    <option value="direct">{t('admin.videos.sourceDirect', 'Direct video URL')}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.videos.videoUrl', 'Video URL')}</label>
                  <input
                    type="url"
                    {...register('video_url')}
                    className="block w-full rounded-xl border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    placeholder={
                      sourceType === 'embed'
                        ? t('admin.videos.embedPlaceholder', 'https://www.youtube.com/watch?v=...')
                        : t('admin.videos.directPlaceholder', 'https://example.com/video.mp4')
                    }
                  />
                </div>

                {sourceType === 'upload' && (
                  <div className="rounded-xl border-2 border-dashed border-stone-300 p-6 text-center transition-colors hover:bg-stone-50">
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
                      disabled={uploadingVideo}
                    >
                      {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingVideo
                        ? uploadProgress != null
                          ? t('admin.videos.uploadingProgress', 'Uploading {{progress}}%', { progress: uploadProgress })
                          : t('admin.blog.uploading')
                        : t('admin.videos.uploadVideo', 'Upload video')}
                    </button>
                    <p className="mt-2 text-xs leading-relaxed text-stone-500">
                      {t(
                        'admin.videos.uploadLimitHelp',
                        'MP4, WebM, OGG, MOV. Bucket target: 1GB. Supabase Free projects still have a 50MB global upload limit.'
                      )}
                    </p>
                  </div>
                )}

                {(sourceType === 'direct' || sourceType === 'embed') && (
                  <button
                    type="button"
                    onClick={handleGenerateCoverFromUrl}
                    disabled={generatingCover || !videoUrl.trim()}
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generatingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {generatingCover ? t('admin.videos.generatingCover', 'Generating cover...') : t('admin.videos.generateCover', 'Generate cover')}
                  </button>
                )}

                {sourceType === 'embed' && (
                  <p className="rounded-xl bg-stone-50 p-3 text-xs leading-relaxed text-stone-500">
                    {t('admin.videos.embedHelp', 'Paste a YouTube or Vimeo URL (watch, Shorts, or youtu.be). The embed and cover are filled in automatically.')}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <ImageIcon className="h-4 w-4 text-stone-400" />
                    {t('admin.videos.thumbnail', 'Thumbnail')}
                  </h4>
                  {durationSeconds ? <span className="text-xs text-stone-500">{durationSeconds}s</span> : null}
                </div>
                <div className="aspect-video overflow-hidden rounded-xl border border-stone-200 bg-white">
                  {thumbUrl ? (
                    <img src={thumbUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-stone-400">
                      <ImageIcon className="mb-2 h-8 w-8" />
                      <p className="text-xs leading-relaxed">
                        {t('admin.videos.autoCoverHelp', 'The cover is generated from the video.')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-5">
              <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900">
                <Tag className="h-4 w-4 text-stone-400" />
                {t('admin.videos.metaSection', 'Video Details')}
              </h3>
            </div>
            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.blog.fieldStatus')}</label>
                <select
                  {...register('status')}
                  className="block w-full rounded-xl border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                >
                  <option value="draft">{t('admin.blog.draft')}</option>
                  <option value="published">{t('admin.blog.published')}</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.blog.fieldSlug')}</label>
                <input
                  type="text"
                  {...register('slug')}
                  className="block w-full rounded-xl border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  placeholder={t('admin.videos.slugPlaceholder', 'auto-from-title')}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.blog.fieldCategory')}</label>
                <select
                  {...register('category')}
                  className="block w-full rounded-xl border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                >
                  <option value="">-</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`videos.categories.${cat}`, cat)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">{t('admin.videos.tags', 'Tags')}</label>
                <input
                  type="text"
                  {...register('tags')}
                  className="block w-full rounded-xl border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  placeholder={t('admin.videos.tagsPlaceholder', 'anti-fog, touch switch, bathroom')}
                />
                <p className="mt-1.5 text-xs text-stone-500">{t('admin.videos.tagsHelp', 'Comma-separated tags drive automatic product recommendations.')}</p>
              </div>
            </div>
          </div>
        </form>

        {FREE_PLAN_LIMIT_BYTES < TARGET_UPLOAD_LIMIT_BYTES && (
          <p className="mt-5 text-xs leading-relaxed text-stone-500">
            {t('admin.videos.freePlanNote', {
              size: formatFileSize(53.5 * 1024 * 1024),
              limit: formatFileSize(FREE_PLAN_LIMIT_BYTES),
              defaultValue:
                'Supabase note: a {{size}} file needs the project global Storage upload limit raised above {{limit}}.',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
