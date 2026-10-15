import React, { useEffect, useMemo, useRef, useState } from 'react';
import MDEditor, { commands as mdCommands, type ICommand, type RefMDEditor } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { AlertTriangle, ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  checkDescription,
  descriptionImageMarkdown,
  extractDescriptionImages,
  insertDescriptionImage,
  removeDescriptionImage,
  type DescriptionImage,
  type UsedDescription,
} from '../../utils/descriptionImages';
import { optimizeImage } from '../../utils/optimizeImage';
import DescriptionImageDialog, { descriptionIssueText, type DescriptionImageValue } from './DescriptionImageDialog';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Photo descriptions on other products, which this one may not reuse. */
  usedElsewhere: readonly UsedDescription[];
  /** Goes up each time a save is stopped by a photo problem, to bring the photo list into view. */
  saveBlocked: number;
}

/** The open dialog: a new photo to insert at offset `at`, or the photo being edited. */
type DialogState = { kind: 'insert'; at: number } | { kind: 'edit'; photo: number };

/**
 * The Long Details editor (Markdown) with photos: Insert image uploads one
 * and puts it where the cursor is, with the description staff must write for
 * it (rules in src/utils/descriptionImages.ts). The list under the editor
 * shows each photo with any problem, and edits or removes it.
 */
export default function ProductDetailsEditor({ value, onChange, placeholder, usedElsewhere, saveBlocked }: Props) {
  const { t, i18n } = useTranslation();
  const editorRef = useRef<RefMDEditor>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const images = useMemo(() => extractDescriptionImages(value), [value]);
  const issues = useMemo(
    () =>
      images.map((image, index) =>
        checkDescription(image.description, {
          others: images.slice(0, index).map((earlier) => earlier.description),
          usedElsewhere,
        }),
      ),
    [images, usedElsewhere],
  );
  const hasProblems = issues.some(Boolean);

  // MDEditor reads its commands once, so the replacement for its image command
  // (which only typed a placeholder) opens the dialog through a stable setter.
  const toolbar = useMemo(() => {
    const label = t('admin.productForm.photos.insertImage', 'Insert image');
    const insertImage: ICommand = {
      name: 'description-image',
      keyCommand: 'description-image',
      icon: mdCommands.image.icon,
      buttonProps: { 'aria-label': label, title: label },
      execute: (state) => setDialog({ kind: 'insert', at: state.selection.end }),
    };
    return mdCommands.getCommands().map((command) => (command.name === 'image' ? insertImage : command));
  }, [t, i18n.language]);

  useEffect(() => {
    if (!saveBlocked) return;
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [saveBlocked]);

  function openInsert() {
    const textarea = editorRef.current?.textarea;
    setDialog({ kind: 'insert', at: textarea ? textarea.selectionEnd : value.length });
  }

  function insertPhoto(at: number, photo: DescriptionImageValue) {
    const edit = insertDescriptionImage(value, at, descriptionImageMarkdown(photo.src, photo.description));
    const textarea = editorRef.current?.textarea;
    // Typing it in through the browser keeps Undo working; a hidden textarea
    // (preview mode) gets the new value directly.
    if (textarea && textarea.offsetParent !== null && textarea.value === value) {
      textarea.focus();
      textarea.setSelectionRange(edit.start, edit.end);
      if (document.execCommand('insertText', false, edit.insert)) {
        textarea.setSelectionRange(edit.cursor, edit.cursor);
        return;
      }
    }
    onChange(edit.text);
  }

  function replacePhoto(image: DescriptionImage, photo: DescriptionImageValue) {
    if (image.start < 0) return;
    const markdown = descriptionImageMarkdown(photo.src, photo.description);
    onChange(`${value.slice(0, image.start)}${markdown}${value.slice(image.start + image.raw.length)}`);
  }

  function removePhoto(image: DescriptionImage) {
    if (!window.confirm(t('admin.productForm.photos.removeConfirm', 'Remove this photo from the description?'))) return;
    onChange(removeDescriptionImage(value, image));
  }

  function submitDialog(photo: DescriptionImageValue) {
    if (dialog?.kind === 'insert') insertPhoto(dialog.at, photo);
    if (dialog?.kind === 'edit') replacePhoto(images[dialog.photo], photo);
    setDialog(null);
  }

  const editing = dialog?.kind === 'edit' ? images[dialog.photo] : undefined;

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-stone-200">
        <div data-color-mode="light">
          <MDEditor
            ref={editorRef}
            value={value}
            onChange={(next) => onChange(next || '')}
            commands={toolbar}
            preview="edit"
            height={400}
            className="w-full !border-0"
            textareaProps={{ placeholder }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-stone-500">
          {t(
            'admin.productForm.photos.hint',
            'Insert image adds a photo where the cursor is. Every photo needs its own description, shown under it as a caption.',
          )}
        </p>
        <button
          type="button"
          onClick={openInsert}
          className="inline-flex shrink-0 items-center rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200"
        >
          <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
          {t('admin.productForm.photos.insertImage', 'Insert image')}
        </button>
      </div>

      {images.length > 0 && (
        <div ref={listRef} className="mt-4 overflow-hidden rounded-xl border border-stone-200 scroll-mt-24">
          <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/50 px-4 py-3">
            <h4 className="text-sm font-semibold text-stone-900">
              {t('admin.productForm.photos.listTitle', 'Photos in this description')}
            </h4>
            <span className="rounded-full bg-stone-200/70 px-2 py-0.5 text-xs font-medium tabular-nums text-stone-600">
              {images.length}
            </span>
          </div>
          {saveBlocked > 0 && hasProblems && (
            <p role="alert" className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {t('admin.productForm.photos.saveBlocked', 'Fix the photos marked below before saving.')}
            </p>
          )}
          <ol className="divide-y divide-stone-100">
            {images.map((image, index) => {
              const issue = issues[index];
              return (
                <li key={`${index}:${image.src}`} className="flex items-start gap-3 p-3">
                  <img
                    src={optimizeImage(image.src, { width: 160 }) || image.src}
                    alt=""
                    width="56"
                    height="56"
                    loading="lazy"
                    className="h-14 w-14 shrink-0 rounded-lg border border-stone-200 bg-stone-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-stone-500">
                      {t('admin.productForm.photos.photoNumber', 'Photo {{n}}', { n: index + 1 })}
                    </p>
                    <p className={`mt-0.5 line-clamp-2 text-sm ${image.description ? 'text-stone-800' : 'italic text-stone-400'}`}>
                      {image.description || t('admin.productForm.photos.noDescription', 'No description yet')}
                    </p>
                    {issue && (
                      <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-red-600">
                        <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                        {descriptionIssueText(t, issue)}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDialog({ kind: 'edit', photo: index })}
                      disabled={image.start < 0}
                      className="inline-flex items-center rounded-lg px-2 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40"
                      title={t('admin.productForm.photos.edit', 'Edit description')}
                    >
                      <Pencil className="h-3.5 w-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">{t('admin.productForm.photos.edit', 'Edit description')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(image)}
                      disabled={image.start < 0}
                      className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      title={t('admin.productForm.photos.remove', 'Remove photo')}
                      aria-label={t('admin.productForm.photos.remove', 'Remove photo')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {dialog && (
        <DescriptionImageDialog
          initial={editing ? { src: editing.src, description: editing.description } : null}
          others={images.filter((image) => image !== editing).map((image) => image.description)}
          usedElsewhere={usedElsewhere}
          onSubmit={submitDialog}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
