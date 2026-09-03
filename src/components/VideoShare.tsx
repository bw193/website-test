import React, { useEffect, useState } from 'react';
import { Check, Link2, Linkedin, Mail, MessageCircle, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VideoShareProps {
  /** Absolute canonical URL of the watch page. */
  url: string;
  title: string;
  className?: string;
}

const baseButton =
  'inline-flex h-10 items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F6]';

/**
 * Share row for watch pages. Buyers forward product clips to colleagues and
 * installers, so the fast paths are copy-link, LinkedIn, WhatsApp and email;
 * the OS share sheet is offered where the browser supports it.
 */
export default function VideoShare({ url, title, className = '' }: VideoShareProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (!copied) return;
    const handle = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(handle);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt(t('videos.share.copyPrompt', 'Copy this link'), url);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // Dismissed share sheet — nothing to report.
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const targets = [
    {
      key: 'linkedin',
      label: t('videos.share.linkedin', 'Share on LinkedIn'),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: Linkedin,
    },
    {
      key: 'whatsapp',
      label: t('videos.share.whatsapp', 'Share on WhatsApp'),
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      Icon: MessageCircle,
    },
    {
      key: 'email',
      label: t('videos.share.email', 'Share by email'),
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      Icon: Mail,
    },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <span className="mr-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {t('videos.share.label', 'Share')}
      </span>
      <button type="button" onClick={copy} className={baseButton} aria-live="polite">
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
        {copied ? t('videos.share.copied', 'Link copied') : t('videos.share.copy', 'Copy link')}
      </button>
      {targets.map(({ key, label, href, Icon }) => (
        <a
          key={key}
          href={href}
          target={key === 'email' ? undefined : '_blank'}
          rel={key === 'email' ? undefined : 'noopener noreferrer'}
          aria-label={label}
          title={label}
          className={`${baseButton} w-10 justify-center px-0`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </a>
      ))}
      {canNativeShare && (
        <button
          type="button"
          onClick={nativeShare}
          aria-label={t('videos.share.more', 'More sharing options')}
          title={t('videos.share.more', 'More sharing options')}
          className={`${baseButton} w-10 justify-center px-0`}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
