import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { supabase } from '../../supabase';
import {
  MAX_DESCRIPTION_CHARS,
  MIN_DESCRIPTION_WORDS,
  checkDescription,
  countWords,
  descriptionImageFileName,
  type DescriptionIssue,
  type UsedDescription,
} from '../../utils/descriptionImages';
import { optimizeImage } from '../../utils/optimizeImage';

const BUCKET = 'product-images';
const ACCEPT = 'image/jpeg,image/png,image/webp';
const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
// Photos up to this size are uploaded untouched, so fine text in a diagram is
// only compressed once, when the page asks for a smaller copy. Bigger files
// (straight off a phone camera) are first shrunk here.
const DIRECT_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
const SHRUNK_MAX_WIDTH = 2000;

export function descriptionIssueText(t: TFunction, issue: DescriptionIssue): string {
  switch (issue.kind) {
    case 'missing':
      return t('admin.productForm.photos.errors.missing', 'Write a description for this photo.');
    case 'tooShort':
      return t('admin.productForm.photos.errors.tooShort', 'Use at least {{min}} words.', { min: MIN_DESCRIPTION_WORDS });
    case 'tooLong':
      return t('admin.productForm.photos.errors.tooLong', 'Keep it to {{max}} characters.', { max: MAX_DESCRIPTION_CHARS });
    case 'repeatedHere':
      return t('admin.productForm.photos.errors.repeatedHere', 'Another photo in this description already has this text.');
    case 'usedElsewhere':
      return t('admin.productForm.photos.errors.usedElsewhere', 'Already used on “{{title}}”. Write one for this product.', {
        title: issue.productTitle,
      });
  }
}

async function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the photo'))), 'image/webp', 0.85),
  );
}

/**
 * Uploads a photo for the details next to the gallery photos, named with its
 * size (see descriptionImageSize) so the product page can reserve its space.
 */
async function uploadDescriptionPhoto(file: File): Promise<{ src: string; width: number; height: number }> {
  if (!EXTENSIONS[file.type]) throw new Error('unsupported');
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('unsupported');
  });
  let width = bitmap.width;
  let height = bitmap.height;
  let body: Blob = file;
  let extension = EXTENSIONS[file.type];
  try {
    if (file.size > DIRECT_UPLOAD_MAX_BYTES) {
      const scale = Math.min(1, SHRUNK_MAX_WIDTH / width);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = Object.assign(document.createElement('canvas'), { width, height });
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not shrink the photo');
      context.drawImage(bitmap, 0, 0, width, height);
      body = await toBlob(canvas);
      // Safari can't encode WebP and hands back a PNG instead.
      extension = EXTENSIONS[body.type] ?? 'webp';
    }
  } finally {
    bitmap.close();
  }

  const path = `products/${descriptionImageFileName({ width, height }, extension)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    cacheControl: '31536000',
    contentType: body.type || file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { src: data.publicUrl, width, height };
}

export interface DescriptionImageValue {
  src: string;
  description: string;
}

interface Props {
  /** The photo whose description is being changed; null to add a new photo. */
  initial: DescriptionImageValue | null;
  /** Descriptions of the other photos in these details. */
  others: readonly string[];
  usedElsewhere: readonly UsedDescription[];
  onSubmit: (value: DescriptionImageValue) => void;
  onClose: () => void;
}

export default function DescriptionImageDialog({ initial, others, usedElsewhere, onSubmit, onClose }: Props) {
  const { t } = useTranslation();
  const id = useId();
  const [src, setSrc] = useState(initial?.src ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  // Errors stay quiet until staff have typed something, except when editing.
  const [touched, setTouched] = useState(initial !== null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Alt text and captions are one line.
  const text = description.replace(/\s+/g, ' ').trim();
  const issue = checkDescription(text, { others, usedElsewhere });
  const canSubmit = Boolean(src) && !uploading && issue === null;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    (initial ? textareaRef.current : chooseRef.current)?.focus();
  }, [initial]);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadDescriptionPhoto(file);
      setSrc(uploaded.src);
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error uploading a description photo', error);
      setUploadError(
        error instanceof Error && error.message === 'unsupported'
          ? t('admin.productForm.photos.unsupported', 'This file can’t be used. Choose a JPG, PNG or WebP photo.')
          : t('admin.productForm.photos.uploadFailed', 'Upload failed. Please try again.'),
      );
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    if (canSubmit) onSubmit({ src, description: text });
  }

  const fileInput = (
    <input ref={fileInputRef} type="file" accept={ACCEPT} onChange={handleFile} disabled={uploading} className="hidden" />
  );

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-stone-100 bg-stone-50/50 px-6 py-4">
          <h2 id={`${id}-title`} className="text-base font-semibold text-stone-900">
            {initial
              ? t('admin.productForm.photos.titleEdit', 'Edit photo description')
              : t('admin.productForm.photos.titleInsert', 'Insert image')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('admin.productForm.cancel', 'Cancel')}
            className="-mr-2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          {fileInput}
          {src ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-2">
              <img
                src={optimizeImage(src, { width: 800 }) || src}
                alt=""
                className="mx-auto max-h-60 rounded-lg object-contain"
              />
              {!initial && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mx-auto mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
                >
                  {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {uploading
                    ? t('admin.productForm.uploading', 'Uploading...')
                    : t('admin.productForm.photos.replace', 'Choose another photo')}
                </button>
              )}
            </div>
          ) : (
            <button
              ref={chooseRef}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-44 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-stone-300 text-stone-500 transition-colors hover:border-stone-400 hover:bg-stone-50 focus:outline-none focus-visible:border-stone-900 disabled:cursor-wait"
            >
              <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              </span>
              <span className="text-sm font-medium text-stone-900">
                {uploading
                  ? t('admin.productForm.uploading', 'Uploading...')
                  : t('admin.productForm.photos.choose', 'Choose a photo')}
              </span>
              <span className="text-xs text-stone-500">{t('admin.productForm.photos.chooseHint', 'JPG, PNG or WebP')}</span>
            </button>
          )}
          {uploadError && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {uploadError}
            </p>
          )}

          <div>
            <label htmlFor={`${id}-description`} className="mb-1.5 block text-sm font-medium text-stone-700">
              {t('admin.productForm.photos.descLabel', 'Photo description')}
            </label>
            <p id={`${id}-hint`} className="mb-2 text-xs leading-relaxed text-stone-500">
              {t(
                'admin.productForm.photos.descHint',
                'Say what this photo shows for this product, in at least {{min}} words. It appears under the photo and Google reads it, so write it for this product instead of copying it from another one.',
                { min: MIN_DESCRIPTION_WORDS },
              )}
            </p>
            <textarea
              id={`${id}-description`}
              ref={textareaRef}
              rows={3}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setTouched(true);
              }}
              placeholder={t(
                'admin.productForm.photos.descPlaceholder',
                'e.g. Layer structure of the 5 mm copper-free silver mirror used in this backlit LED mirror',
              )}
              aria-invalid={touched && issue !== null}
              aria-describedby={`${id}-hint ${id}-status`}
              className="block w-full resize-y rounded-xl border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 transition-colors focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
            />
            <div id={`${id}-status`} className="mt-1.5 flex items-start justify-between gap-4 text-xs">
              <span className="font-medium text-red-600">{touched && issue ? descriptionIssueText(t, issue) : ''}</span>
              <span className="whitespace-nowrap tabular-nums text-stone-500">
                {t('admin.productForm.photos.count', '{{words}} words (min {{min}}) · {{chars}}/{{max}} characters', {
                  words: countWords(text),
                  min: MIN_DESCRIPTION_WORDS,
                  chars: text.length,
                  max: MAX_DESCRIPTION_CHARS,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-stone-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
          >
            {t('admin.productForm.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-stone-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {initial ? t('admin.productForm.photos.save', 'Save') : t('admin.productForm.photos.insert', 'Insert')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
