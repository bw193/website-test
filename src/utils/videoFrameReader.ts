/**
 * FFmpeg, compiled to WebAssembly, for reading frames from videos the browser
 * cannot decode itself — staff phones record H.265/HEVC, which many Chrome and
 * Firefox installs can only play as sound over a black picture.
 *
 * Only captureVideoFrame() imports this, and only after the browser has failed,
 * so public pages never load it. The core is about 10 MB to download (see
 * ffmpegCoreWasm in vite.config.ts), fetched once per staff browser and cached.
 */
import { FFFSType, FFmpeg } from '@ffmpeg/ffmpeg';
import coreURL from '@ffmpeg/core?url';

export type VideoReaderProgress =
  | { stage: 'download'; ratio: number | null }
  | { stage: 'read' };

export interface VideoReader {
  /** Seconds, as the container reports them; null when it doesn't. */
  durationSeconds: number | null;
  /** RGBA pixels of the keyframe at or before `time`, scaled and centre-cropped to width × height. */
  frameAt(time: number, width: number, height: number): Promise<Uint8ClampedArray>;
}

const INPUT_DIR = '/input';
const INPUT_FILE = `${INPUT_DIR}/clip`;
const FRAME_FILE = '/frame.rgba';
const EXEC_TIMEOUT_MS = 60_000;

let ffmpegPromise: Promise<FFmpeg> | null = null;
// Sessions share one FFmpeg instance and its file system, so they run one at a time.
let queue: Promise<unknown> = Promise.resolve();

async function downloadCore(onProgress?: (progress: VideoReaderProgress) => void): Promise<string> {
  const response = await fetch(__FFMPEG_CORE_WASM__);
  if (!response.ok || !response.body) throw new Error(`Could not download the video reader (HTTP ${response.status}).`);
  // When the server sends it with Content-Encoding, the browser unpacks it as it
  // arrives and the bytes no longer match Content-Length, so no percentage then.
  const total = response.headers.get('content-encoding') ? 0 : Number(response.headers.get('content-length')) || 0;
  const chunks: Uint8Array[] = [];
  let received = 0;
  let lastPercent = -1;
  onProgress?.({ stage: 'download', ratio: total ? 0 : null });
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    const percent = total ? Math.min(Math.floor((received / total) * 100), 100) : null;
    if (percent !== null && percent !== lastPercent) {
      lastPercent = percent;
      onProgress?.({ stage: 'download', ratio: percent / 100 });
    }
  }
  const packed = new Blob(chunks);
  // Unpack it here, unless a server along the way already did.
  const magic = new Uint8Array(await packed.slice(0, 2).arrayBuffer());
  const wasm = magic[0] === 0x1f && magic[1] === 0x8b
    ? await new Response(packed.stream().pipeThrough(new DecompressionStream('gzip'))).blob()
    : packed;
  return URL.createObjectURL(new Blob([wasm], { type: 'application/wasm' }));
}

function loadFFmpeg(onProgress?: (progress: VideoReaderProgress) => void): Promise<FFmpeg> {
  ffmpegPromise ??= (async () => {
    const wasmURL = await downloadCore(onProgress);
    const ffmpeg = new FFmpeg();
    try {
      await ffmpeg.load({ coreURL, wasmURL });
      return ffmpeg;
    } catch (error) {
      ffmpeg.terminate();
      throw error;
    } finally {
      URL.revokeObjectURL(wasmURL);
    }
  })().catch((error: unknown) => {
    ffmpegPromise = null;
    throw error;
  });
  return ffmpegPromise;
}

async function fetchVideo(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download the video (HTTP ${response.status}).`);
  return response.blob();
}

async function probeDuration(ffmpeg: FFmpeg): Promise<number | null> {
  let duration: number | null = null;
  const onLog = ({ message }: { message: string }) => {
    const match = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(message);
    if (match) duration = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  };
  ffmpeg.on('log', onLog);
  try {
    // With no output FFmpeg only prints the container header, then exits with an error.
    await ffmpeg.exec(['-hide_banner', '-i', INPUT_FILE], EXEC_TIMEOUT_MS);
  } finally {
    ffmpeg.off('log', onLog);
  }
  return duration;
}

async function readFrame(ffmpeg: FFmpeg, time: number, width: number, height: number): Promise<Uint8ClampedArray> {
  const code = await ffmpeg.exec(
    [
      '-hide_banner', '-loglevel', 'error',
      // Inexact input seeking decodes just the keyframe at or before `time`.
      '-ss', time.toFixed(3), '-noaccurate_seek', '-i', INPUT_FILE,
      '-frames:v', '1', '-an',
      '-vf', `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`,
      '-f', 'rawvideo', '-pix_fmt', 'rgba', '-y', FRAME_FILE,
    ],
    EXEC_TIMEOUT_MS
  );
  if (code !== 0) throw new Error(`The video reader could not decode a frame at ${time.toFixed(1)}s.`);
  const data = await ffmpeg.readFile(FRAME_FILE);
  await ffmpeg.deleteFile(FRAME_FILE);
  if (!(data instanceof Uint8Array) || data.length !== width * height * 4) {
    throw new Error('The video reader returned an incomplete frame.');
  }
  return new Uint8ClampedArray(data.buffer, data.byteOffset, data.length);
}

/** Runs `work` with FFmpeg reading `source`, loading FFmpeg on first use. */
export function withVideoReader<T>(
  source: File | string,
  onProgress: ((progress: VideoReaderProgress) => void) | undefined,
  work: (reader: VideoReader) => Promise<T>
): Promise<T> {
  const session = queue.then(async () => {
    // Fetch the clip first, so an unreachable one doesn't cost the core download.
    const clip = new File([source instanceof File ? source : await fetchVideo(source)], 'clip');
    const ffmpeg = await loadFFmpeg(onProgress);
    onProgress?.({ stage: 'read' });
    // The directory survives from an earlier session, if there was one.
    await ffmpeg.createDir(INPUT_DIR).catch(() => undefined);
    // WORKERFS reads the file in place instead of copying it into FFmpeg's memory.
    if (!(await ffmpeg.mount(FFFSType.WORKERFS, { files: [clip] }, INPUT_DIR))) {
      throw new Error('The video reader could not open the file.');
    }
    try {
      return await work({
        durationSeconds: await probeDuration(ffmpeg),
        frameAt: (time, width, height) => readFrame(ffmpeg, time, width, height),
      });
    } finally {
      await ffmpeg.unmount(INPUT_DIR);
    }
  });
  queue = session.catch(() => undefined);
  return session;
}
