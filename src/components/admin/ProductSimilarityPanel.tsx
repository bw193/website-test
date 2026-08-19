import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ChevronDown, ScanSearch } from 'lucide-react';
import { FilterPills, StatusPill } from './AdminUi';
import { PRODUCT_IMAGE_PLACEHOLDER, handleImageError } from '../../utils/imagePlaceholder';
import {
  clusterSimilarProducts,
  similarityLevel,
  similarityPercent,
  SIMILARITY_THRESHOLDS,
  type SimilarMatch,
  type SimilarityProduct,
  type SimilarityReason,
} from '../../utils/productSimilarity';

function firstImage(images: unknown): string | null {
  if (Array.isArray(images) && typeof images[0] === 'string' && images[0]) return images[0];
  return null;
}

function ReasonText({ reasons }: { reasons: SimilarityReason[] }) {
  const { t } = useTranslation();
  const labels = reasons.map((reason) => {
    if (reason === 'title') return t('admin.dashboard.similarity.reasonTitle', 'Title');
    if (reason === 'specs') return t('admin.dashboard.similarity.reasonSpecs', 'Specifications');
    return t('admin.dashboard.similarity.reasonCategory', 'Category');
  });
  if (labels.length === 0) return null;
  return <span className="text-xs text-stone-400">{labels.join(' · ')}</span>;
}

function LevelPill({ score }: { score: number }) {
  const { t } = useTranslation();
  const level = similarityLevel(score);
  const tone = level === 'duplicate' ? 'red' : level === 'similar' ? 'amber' : 'stone';
  const label =
    level === 'duplicate'
      ? t('admin.dashboard.similarity.duplicate', 'Likely duplicate')
      : level === 'similar'
        ? t('admin.dashboard.similarity.similar', 'Similar')
        : t('admin.dashboard.similarity.related', 'Related');
  return <StatusPill tone={tone}>{label}</StatusPill>;
}

function ProductThumb({
  product,
  uncategorized,
  highlighted,
  savedLabel,
}: {
  product: SimilarityProduct;
  uncategorized: string;
  highlighted?: boolean;
  savedLabel?: string;
}) {
  const { t } = useTranslation();
  const src = firstImage(product.images) || PRODUCT_IMAGE_PLACEHOLDER;
  const categoryLabel = product.category
    ? t(`products.categories.${product.category}`, product.category)
    : uncategorized;
  return (
    <Link
      to={`/admin/products/${product.id}`}
      className={`group flex min-w-0 items-center gap-3 rounded-xl border p-2.5 transition-colors ${
        highlighted
          ? 'border-amber-400 bg-amber-50'
          : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/60'
      }`}
    >
      <img
        src={src}
        alt=""
        className="h-14 w-14 shrink-0 rounded-lg object-cover bg-stone-100"
        onError={handleImageError}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stone-900 group-hover:text-amber-800">{product.title}</p>
        <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wide text-stone-400">
          {categoryLabel}
        </p>
      </div>
      {highlighted && savedLabel ? (
        <StatusPill tone="amber">{savedLabel}</StatusPill>
      ) : null}
    </Link>
  );
}

export function ProductSimilarityPanel({
  products,
  uncategorized,
  open,
  onOpenChange,
  threshold,
  onThresholdChange,
  focusProductId,
}: {
  products: SimilarityProduct[];
  uncategorized: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threshold: number;
  onThresholdChange: (value: number) => void;
  focusProductId?: string | null;
}) {
  const { t } = useTranslation();
  const clusters = useMemo(() => clusterSimilarProducts(products, threshold), [products, threshold]);
  const orderedClusters = useMemo(() => {
    if (!focusProductId) return clusters;
    return [...clusters].sort((a, b) => {
      const aHit = a.products.some((product) => product.id === focusProductId) ? 1 : 0;
      const bHit = b.products.some((product) => product.id === focusProductId) ? 1 : 0;
      return bHit - aHit;
    });
  }, [clusters, focusProductId]);
  const duplicateCount = clusters.filter((cluster) => cluster.maxScore >= 0.9).length;
  const focusHasMatch = Boolean(
    focusProductId && clusters.some((cluster) => cluster.products.some((product) => product.id === focusProductId))
  );
  const savedLabel = t('admin.dashboard.similarity.justSaved', 'Just saved');

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-stone-50"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
          <ScanSearch className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-stone-900">
              {t('admin.dashboard.similarity.title', 'Similar product detection')}
            </span>
            {duplicateCount > 0 ? (
              <StatusPill tone="red">
                {t('admin.dashboard.similarity.duplicateCount', '{{count}} likely duplicates', { count: duplicateCount })}
              </StatusPill>
            ) : clusters.length > 0 ? (
              <StatusPill tone="amber">
                {t('admin.dashboard.similarity.pairs', '{{count}} similar groups', { count: clusters.length })}
              </StatusPill>
            ) : (
              <StatusPill tone="stone">{t('admin.dashboard.similarity.clear', 'No close matches')}</StatusPill>
            )}
          </span>
          <span className="mt-0.5 block text-xs text-stone-500">
            {t(
              'admin.dashboard.similarity.subtitle',
              'Compares titles, specifications, and categories to flag duplicate or near-match listings.'
            )}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-stone-100 px-4 py-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              {t('admin.dashboard.similarity.threshold', 'Minimum match')}
            </p>
            <FilterPills
              value={String(threshold)}
              onChange={(value) => onThresholdChange(Number(value))}
              options={SIMILARITY_THRESHOLDS.map((value) => ({
                id: String(value),
                label: `${Math.round(value * 100)}%`,
              }))}
            />
          </div>

          {focusProductId ? (
            <p className="mb-4 text-sm text-stone-600">
              {t('admin.dashboard.similarity.scanAfterSave', 'Catalog re-scanned after save.')}
              {!focusHasMatch && products.length >= 2
                ? ` ${t('admin.dashboard.similarity.savedNoMatch', 'The product you just saved has no close matches at this threshold.')}`
                : ''}
            </p>
          ) : null}

          {products.length < 2 ? (
            <p className="text-sm text-stone-500">
              {t('admin.dashboard.similarity.needMore', 'Add at least two products to compare the catalog.')}
            </p>
          ) : clusters.length === 0 ? (
            <p className="text-sm text-stone-500">
              {t('admin.dashboard.similarity.noMatches', 'No similar products found at this threshold.')}
            </p>
          ) : (
            <div className="space-y-4">
              {orderedClusters.map((cluster) => {
                const containsFocus = Boolean(
                  focusProductId && cluster.products.some((product) => product.id === focusProductId)
                );
                return (
                <div
                  key={cluster.products.map((product) => product.id).join('-')}
                  className={`rounded-xl border p-3 ${
                    containsFocus ? 'border-amber-300 bg-amber-50/80' : 'border-stone-200 bg-stone-50/70'
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <LevelPill score={cluster.maxScore} />
                    <span className="text-xs font-semibold tabular-nums text-stone-500">
                      {t('admin.dashboard.similarity.score', '{{score}}% match', {
                        score: similarityPercent(cluster.maxScore),
                      })}
                    </span>
                    <ReasonText reasons={cluster.reasons} />
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {cluster.products.map((product) => (
                      <ProductThumb
                        key={product.id}
                        product={product}
                        uncategorized={uncategorized}
                        highlighted={product.id === focusProductId}
                        savedLabel={savedLabel}
                      />
                    ))}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ProductSimilarityHints({
  matches,
}: {
  matches: SimilarMatch[];
}) {
  const { t } = useTranslation();
  const uncategorized = t('admin.dashboard.products.uncategorized');
  const top = matches[0];
  const warn = Boolean(top && top.score >= 0.82);

  return (
    <div className={`overflow-hidden rounded-2xl border shadow-sm ${warn ? 'border-amber-300 bg-amber-50/40' : 'border-stone-200 bg-white'}`}>
      <div className="flex items-start gap-2 border-b border-stone-100 px-5 py-4">
        {warn ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        ) : (
          <ScanSearch className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
        )}
        <div>
          <h3 className="text-sm font-semibold text-stone-900">
            {warn
              ? t('admin.productForm.similarity.likelyDuplicate', 'Possible duplicate')
              : t('admin.productForm.similarity.title', 'Similar products')}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">
            {t(
              'admin.productForm.similarity.hint',
              'Checked against the catalog using title, specifications, and category.'
            )}
          </p>
        </div>
      </div>
      <div className="p-3">
        {matches.length === 0 ? (
          <p className="px-2 py-3 text-sm text-stone-500">
            {t('admin.productForm.similarity.none', 'No close matches yet. Keep typing a title to check.')}
          </p>
        ) : (
          <div className="space-y-2">
            {matches.map((match) => (
              <div key={match.product.id} className="space-y-1">
                <ProductThumb product={match.product} uncategorized={uncategorized} />
                <div className="flex items-center justify-between px-1">
                  <ReasonText reasons={match.reasons} />
                  <span className="text-[11px] font-semibold tabular-nums text-stone-600">
                    {t('admin.productForm.similarity.match', '{{score}}% similar', {
                      score: similarityPercent(match.score),
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
