import React, { useEffect, useMemo, useState } from 'react';
import { m } from 'motion/react';
import { Search, Video as VideoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import VideoCard from '../components/VideoCard';
import { useCurrentLang } from '../hooks/useLocalizedPath';
import { readInitialVideoList } from '../utils/prerenderData';
import { toVideoListItem } from '../utils/video';
import { buildVideoIndexSchema } from '../utils/videoSchema';
import { runWhenIdle } from '../utils/idle';
import type { VideoListItem, VideoPost } from '../types/video';

const LIST_COLUMNS =
  'id, slug, source_type, video_url, embed_url, thumbnail_url, category, tags, duration_seconds, published_at, title, excerpt';

export default function Videos() {
  const lang = useCurrentLang();
  const { t } = useTranslation();
  const initial = readInitialVideoList();
  const [videos, setVideos] = useState<VideoListItem[]>(initial ?? []);
  const [loading, setLoading] = useState(initial === null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    const refreshVideos = async () => {
      try {
        const { supabase } = await import('../supabase');
        const { data, error } = await supabase
          .from('videos')
          .select(LIST_COLUMNS)
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (error) throw error;
        if (active && data) setVideos((data as VideoPost[]).map((video) => toVideoListItem(video, lang)));
      } catch (e) {
        console.error('Error fetching videos', e);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (initial) {
      const cancel = runWhenIdle(refreshVideos, 2500);
      return () => {
        active = false;
        cancel();
      };
    }

    refreshVideos();
    return () => {
      active = false;
    };
  }, [lang]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((video) => video.category && set.add(video.category));
    return Array.from(set);
  }, [videos]);

  const filtered = videos.filter((video) => {
    const matchesCat = activeCat ? video.category === activeCat : true;
    const q = query.trim().toLowerCase();
    const matchesQuery = q
      ? `${video.title} ${video.excerpt} ${video.category || ''} ${(video.tags || []).join(' ')}`
          .toLowerCase()
          .includes(q)
      : true;
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 selection:bg-amber-200/60 selection:text-stone-900">
      <SEO
        title={t('videos.metaTitle', 'BOLEN Mirror Videos | Product Demos & Factory Walkthroughs')}
        description={t(
          'videos.metaDescription',
          'Watch BOLEN mirror product demos, factory walkthroughs, installation clips, and LED smart mirror feature videos.'
        )}
        path="/videos"
        schema={buildVideoIndexSchema(lang)}
      />

      <header className="bg-stone-950 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <m.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-amber-400"
          >
            {t('videos.kicker', 'Product proof in motion')}
          </m.p>
          <m.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="font-serif text-5xl leading-none tracking-tight sm:text-6xl md:text-7xl"
          >
            {t('videos.titleLead', 'BOLEN')}{' '}
            <span className="italic text-stone-400">{t('videos.titleAccent', 'Videos')}</span>
          </m.h1>
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-7 max-w-2xl text-lg font-light leading-relaxed text-stone-300"
          >
            {t(
              'videos.intro',
              'See LED mirrors, smart features, factory processes, and installation details before you specify a product.'
            )}
          </m.p>
        </div>
      </header>

      <div className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('videos.search', 'Search videos...')}
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-3 text-sm placeholder-stone-400 transition-colors focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCat(null)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeCat === null ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {t('videos.allVideos', 'All Videos')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      activeCat === cat ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading && videos.length === 0 ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white">
                <div className="aspect-video bg-stone-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 rounded bg-stone-200" />
                  <div className="h-4 w-full rounded bg-stone-100" />
                  <div className="h-4 w-2/3 rounded bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl bg-white px-4 py-24 text-center shadow-sm">
            <VideoIcon className="mx-auto mb-4 h-12 w-12 text-stone-300" />
            <p className="text-lg text-stone-500">{t('videos.empty', 'No videos published yet. Check back soon.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
