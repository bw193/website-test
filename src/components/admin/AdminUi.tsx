import React from 'react';
import { Search } from 'lucide-react';

export const adminPrimaryBtn =
  'inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50';

export const adminSecondaryBtn =
  'inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50';

export function PageCanvas({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl">{children}</div>;
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-500">{subtitle}</p>}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm lg:flex-row lg:flex-wrap lg:items-center">
      {children}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 flex-1 ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-xl border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-sm placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
      />
    </div>
  );
}

export function FilterPills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { id: NoInfer<T>; label: string; count?: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              active ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {opt.label}
            {typeof opt.count === 'number' && (
              <span
                className={`rounded-full px-1.5 py-px text-[10px] tabular-nums ${
                  active ? 'bg-white/20 text-white' : 'bg-white text-stone-500'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ResultMeta({ shown, total, label }: { shown: number; total: number; label: string }) {
  return (
    <p className="shrink-0 px-1 text-xs tabular-nums text-stone-400 lg:ml-auto">
      {shown === total ? `${total} ${label}` : `${shown} / ${total} ${label}`}
    </p>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  action,
  embedded,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action?: React.ReactNode;
  embedded?: boolean;
}) {
  return (
    <div className={`px-6 py-14 text-center ${embedded ? '' : 'rounded-2xl border border-dashed border-stone-300 bg-white'}`}>
      <Icon className="mx-auto h-10 w-10 text-stone-300" />
      <p className="mt-3 font-medium text-stone-500">{title}</p>
      {action}
    </div>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: 'amber' | 'sky' | 'emerald' | 'stone' | 'red';
  children: React.ReactNode;
}) {
  const tones = {
    amber: 'bg-amber-100 text-amber-800',
    sky: 'bg-sky-50 text-sky-800',
    emerald: 'bg-emerald-50 text-emerald-700',
    stone: 'bg-stone-100 text-stone-600',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Surface({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}>{children}</div>;
}
