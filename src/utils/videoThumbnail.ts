const FRAME_SAMPLE_COUNT = 5;
const MIN_ACCEPTABLE_LUMA = 22;
const THUMBNAIL_POSTER_WIDTH = 960;
const THUMBNAIL_POSTER_HEIGHT = 1200;

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

function drawVideoPosterFrame(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, canvas: HTMLCanvasElement): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawVideoToCanvasCover(ctx, video, canvas.width, canvas.height);

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

export async function captureVideoFrame(source: File | string): Promise<{ thumbnail: Blob; durationSeconds: number | null }> {
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
    const frameTimes = randomFrameTimes(Number.isFinite(video.duration) ? video.duration : null);

    const canvas = document.createElement('canvas');
    canvas.width = THUMBNAIL_POSTER_WIDTH;
    canvas.height = THUMBNAIL_POSTER_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create a thumbnail canvas.');

    let bestFrame: Blob | null = null;
    let bestLuma = -1;
    for (const time of frameTimes) {
      if (time > 0 && Number.isFinite(video.duration)) {
        await seekVideo(video, time);
      } else {
        await ensureVideoData(video);
      }
      drawVideoPosterFrame(ctx, video, canvas);
      const luma = frameLuma(ctx, canvas.width, canvas.height);
      const frame = await canvasToJpeg(canvas);
      if (luma > bestLuma) {
        bestLuma = luma;
        bestFrame = frame;
      }
      if (luma >= MIN_ACCEPTABLE_LUMA) break;
    }

    if (!bestFrame) throw new Error('Could not generate a thumbnail from this video.');

    return { thumbnail: bestFrame, durationSeconds };
  } finally {
    video.removeAttribute('src');
    video.load();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function getYouTubeId(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || '';
    if (host.endsWith('youtube.com')) {
      return u.searchParams.get('v') || u.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/)?.[1] || '';
    }
  } catch {
    return '';
  }
  return '';
}

export async function deriveEmbedThumbnail(url: string): Promise<string> {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

  try {
    const u = new URL(url);
    if (u.hostname.replace(/^www\./, '').endsWith('vimeo.com')) {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
      if (!res.ok) return '';
      const data = (await res.json()) as { thumbnail_url?: string };
      return data.thumbnail_url || '';
    }
  } catch {
    return '';
  }
  return '';
}
