import { useTranslation } from 'react-i18next';
import { ADMIN_UI_LANGUAGES, setAdminLanguage, type AdminUiLanguage } from '../../i18n';

const LABELS: Record<AdminUiLanguage, string> = {
  en: 'EN',
  zh: '中文',
};

export default function AdminLanguageSwitch({
  variant = 'dark',
}: {
  variant?: 'dark' | 'light';
}) {
  const { t, i18n } = useTranslation();
  const current = (i18n.language.split('-')[0] === 'zh' ? 'zh' : 'en') as AdminUiLanguage;

  const wrap =
    variant === 'dark'
      ? 'bg-white/5'
      : 'bg-stone-100 ring-1 ring-stone-200';
  const idle =
    variant === 'dark'
      ? 'text-stone-500 hover:text-stone-200'
      : 'text-stone-500 hover:text-stone-800';
  const active =
    variant === 'dark'
      ? 'bg-white/10 text-white shadow-sm'
      : 'bg-white text-stone-900 shadow-sm';

  return (
    <div
      className={`inline-flex rounded-lg p-0.5 ${wrap}`}
      role="group"
      aria-label={t('admin.dashboard.changeLanguage', 'Change language')}
    >
      {ADMIN_UI_LANGUAGES.map((code) => {
        const isActive = current === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => {
              if (!isActive) void setAdminLanguage(code);
            }}
            aria-pressed={isActive}
            className={`min-w-[2.75rem] rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors ${
              isActive ? active : idle
            }`}
          >
            {LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
