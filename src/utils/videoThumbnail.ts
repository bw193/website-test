import { isYouTubeShortsUrl, parseYouTubeId } from './video';
import type { VideoReaderProgress } from './videoFrameReader';

export type { VideoReaderProgress };

const FRAME_SAMPLE_COUNT = 5;
const MIN_ACCEPTABLE_LUMA = 22;
const THUMBNAIL_POSTER_WIDTH = 960;
const THUMBNAIL_POSTER_HEIGHT = 1200;

/** Storage folder for covers staff upload by hand; regenerating covers leaves these alone. */
export const CUSTOM_THUMBNAIL_FOLDER = 'thumbnails/custom';

export function isCustomVideoThumbnail(url: string | null | undefined): boolean {
  return Boolean(url && url.includes(`/${CUSTOM_THUMBNAIL_FOLDER}/`));
}

/**
 * The browser loaded the video but cannot draw its picture. An H.265/HEVC
 * phone recording does this in browsers without an HEVC decoder (many Chrome
 * and Firefox installs): the audio and duration load, the picture is 0×0, and
 * every captured "frame" is the empty canvas — which used to be saved as a
 * black cover. captureVideoFrame() then reads the frames with FFmpeg instead,
 * and only throws this when that fails too. The duration travels with it.
 */
export class VideoFrameUnavailableError extends Error {
  durationSeconds: number | null;

  constructor(durationSeconds: number | null) {
    super('This browser cannot show the picture in this video, so no cover was made.');
    this.name = 'VideoFrameUnavailableError';
    this.durationSeconds = durationSeconds;
  }
}

function randomFrameTimes(duration: number | null): number[] {
  if (!duration || !Number.isFinite(duration) || duration <= 1) return [0];
  const start = Math.min(duration * 0.15, Math.max(duration - 0.2, 0));
  const end = Math.max(start, duration * 0.75);
  return Array.from({ length: FRAME_SAMPLE_COUNT }, () => start + Math.random() * Math.max(end - start, 0.1));
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: keyof HTMLMediaElementEventMap): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener(eventName, onEvent);
      video.removeEventListener('error', onError);
    };
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('The video could not be loaded.'));
    };
    video.addEventListener(eventName, onEvent, { once: true });
    video.addEventListener('error', onError, { once: true });
  });
}

async function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  video.currentTime = Math.min(time, Math.max((Number.isFinite(video.duration) ? video.duration : time) - 0.1, 0));
  await waitForVideoEvent(video, 'seeked');
}

async function ensureVideoData(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
  await waitForVideoEvent(video, 'loadeddata');
}

function drawVideoToCanvasCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  targetWidth: number,
  targetHeight: number
): void {
  const sourceWidth = video.videoWidth || 1280;
  const sourceHeight = video.videoHeight || 720;
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  ctx.drawImage(video, (targetWidth - drawWidth) / 2, (targetHeight - drawHeight) / 2, drawWidth, drawHeight);
}

function shadePoster(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const shade = ctx.createLinearGradient(0, 0, 0, canvas.height);
  shade.addColorStop(0, 'rgba(12,10,9,0.04)');
  shade.addColorStop(0.62, 'rgba(12,10,9,0.02)');
  shade.addColorStop(1, 'rgba(12,10,9,0.34)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function frameLuma(ctx: CanvasRenderingContext2D, width: number, height: number): number {
  const sampleWidth = Math.min(width, 160);
  const sampleHeight = Math.min(height, 90);
  const imageData = ctx.getImageData(
    Math.max(0, Math.floor((width - sampleWidth) / 2)),
    Math.max(0, Math.floor((height - sampleHeight) / 2)),
    sampleWidth,
    sampleHeight
  );
  const data = imageData.data;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  return total / (data.length / 4);
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not generate a thumbnail from this video.'));
    }, 'image/jpeg', 0.84);
  });
}

/**
 * Draws a candidate frame for each sample time with `drawFrame` and returns the
 * first bright enough one as a JPEG poster, or else the brightest.
 */
async function pickPosterFrame(
  duration: number | null,
  drawFrame: (ctx: CanvasRenderingContext2D, time: number) => Promise<void>
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL_POSTER_WIDTH;
  canvas.height = THUMBNAIL_POSTER_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a thumbnail canvas.');

  let bestFrame: Blob | null = null;
  let bestLuma = -1;
  for (const time of randomFrameTimes(duration)) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await drawFrame(ctx, time);
    shadePoster(ctx, canvas);
    const luma = frameLuma(ctx, canvas.width, canvas.height);
    const frame = await canvasToJpeg(canvas);
    if (luma > bestLuma) {
      bestLuma = luma;
      bestFrame = frame;
    }
    if (luma >= MIN_ACCEPTABLE_LUMA) break;
  }

  if (!bestFrame) throw new Error('Could not generate a thumbnail from this video.');
  return bestFrame;
}

async function captureWithBrowser(source: File | string): Promise<{ thumbnail: Blob; durationSeconds: number | null }> {
  const video = document.createElement('video');
  const objectUrl = source instanceof File ? URL.createObjectURL(source) : '';
  const src = objectUrl || source;

  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;
  if (!(source instanceof File)) video.crossOrigin = 'anonymous';

  try {
    video.src = src.toString();
    video.load();
    await waitForVideoEvent(video, 'loadedmetadata');

    const durationSeconds = Number.isFinite(video.duration) ? Math.round(video.duration) : null;
    if (!video.videoWidth || !video.videoHeight) throw new VideoFrameUnavailableError(durationSeconds);
    const duration = Number.isFinite(video.duration) ? video.duration : null;

    const thumbnail = await pickPosterFrame(duration, async (ctx, time) => {
      if (time > 0 && duration !== null) {
        await seekVideo(video, time);
      } else {
        await ensureVideoData(video);
      }
      drawVideoToCanvasCover(ctx, video, THUMBNAIL_POSTER_WIDTH, THUMBNAIL_POSTER_HEIGHT);
    });
    return { thumbnail, durationSeconds };
  } finally {
    video.removeAttribute('src');
    video.load();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

async function captureWithReader(
  source: File | string,
  onProgress?: (progress: VideoReaderProgress) => void
): Promise<{ thumbnail: Blob; durationSeconds: number | null }> {
  const { withVideoReader } = await import('./videoFrameReader');
  return withVideoReader(source, onProgress, async (reader) => {
    const thumbnail = await pickPosterFrame(reader.durationSeconds, async (ctx, time) => {
      const pixels = await reader.frameAt(time, THUMBNAIL_POSTER_WIDTH, THUMBNAIL_POSTER_HEIGHT);
      ctx.putImageData(new ImageData(pixels, THUMBNAIL_POSTER_WIDTH, THUMBNAIL_POSTER_HEIGHT), 0, 0);
    });
    return {
      thumbnail,
      durationSeconds: reader.durationSeconds === null ? null : Math.round(reader.durationSeconds),
    };
  });
}

/**
 * A 4:5 JPEG poster from a frame of the video, plus its duration. Browsers that
 * cannot decode the clip (VideoFrameUnavailableError, or a load error) fall back
 * to FFmpeg, which downloads once and reports progress through `onReaderProgress`.
 */
export async function captureVideoFrame(
  source: File | string,
  { onReaderProgress }: { onReaderProgress?: (progress: VideoReaderProgress) => void } = {}
): Promise<{ thumbnail: Blob; durationSeconds: number | null }> {
  try {
    return await captureWithBrowser(source);
  } catch (browserError) {
    try {
      return await captureWithReader(source, onReaderProgress);
    } catch (readerError) {
      console.error('The video reader could not make a cover either', readerError);
      throw browserError;
    }
  }
}

const YOUTUBE_PLACEHOLDER_EDGE = 120;

function isVimeoUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    return host === 'vimeo.com' || host.endsWith('.vimeo.com');
  } catch {
    return false;
  }
}

export function isDerivedEmbedThumbnail(url: string | null | undefined): boolean {
  if (!url) return false;
  return /ytimg\.com|img\.youtube\.com|vimeocdn\.com/i.test(url);
}

function probeImageSize(url: string): Promise<{ width: number; height: number } | null> {
  if (typeof Image === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      resolve(null);
    }, 2500);
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      clearTimeout(timer);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

async function youtubeThumbnailUrl(videoId: string, shorts: boolean): Promise<string> {
  const files = shorts
    ? ['oar2.jpg', 'maxresdefault.jpg', 'hq720.jpg', 'sddefault.jpg', 'hqdefault.jpg', 'mqdefault.jpg']
    : ['maxresdefault.jpg', 'hq720.jpg', 'sddefault.jpg', 'hqdefault.jpg', 'mqdefault.jpg'];
  const fallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  if (typeof Image === 'undefined') return fallback;

  const probed = await Promise.all(
    files.map(async (file) => {
      const candidate = `https://i.ytimg.com/vi/${videoId}/${file}`;
      const size = await probeImageSize(candidate);
      if (!size || size.width <= YOUTUBE_PLACEHOLDER_EDGE || size.height <= YOUTUBE_PLACEHOLDER_EDGE) return null;
      return candidate;
    })
  );
  return probed.find((candidate): candidate is string => Boolean(candidate)) || fallback;
}

export async function deriveEmbedThumbnail(url: string): Promise<string> {
  const youtubeId = parseYouTubeId(url);
  if (youtubeId) return youtubeThumbnailUrl(youtubeId, isYouTubeShortsUrl(url));

  if (!isVimeoUrl(url)) return '';
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
    if (!res.ok) return '';
    const data = (await res.json()) as { thumbnail_url?: string };
    return data.thumbnail_url || '';
  } catch {
    return '';
  }
}
