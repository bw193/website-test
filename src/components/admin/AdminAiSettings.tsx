import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Loader2,
  MessageSquareText,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../supabase';
import { adminPrimaryBtn } from './AdminUi';

type ReceptionistTone = 'concise' | 'consultative' | 'technical';
type AnswerLength = 'short' | 'medium';

type AiReceptionistSettings = {
  reply_guidance: string;
  tone: ReceptionistTone;
  answer_length: AnswerLength;
  email_gate_enabled: boolean;
  free_turns: number;
  max_turns: number;
};

type AiReceptionistFaq = {
  id: string;
  topic: string;
  trigger_phrases: string[];
  answer_en: string;
  answer_zh: string;
  answer_es: string;
  answer_fr: string;
  answer_de: string;
  answer_it: string;
  is_active: boolean;
  priority: number;
  created_at: string | null;
  updated_at: string | null;
};

type FaqField = 'topic' | 'trigger_phrases' | 'answer_en' | 'answer_zh' | 'priority';
type FaqFieldErrors = Partial<Record<FaqField, string>>;
type FaqErrors = Record<string, FaqFieldErrors>;

type Notice = { type: 'success' | 'error'; message: string } | null;

const SETTINGS_COLUMNS =
  'reply_guidance, tone, answer_length, email_gate_enabled, free_turns, max_turns';
const FAQ_COLUMNS =
  'id, topic, trigger_phrases, answer_en, answer_zh, answer_es, answer_fr, answer_de, answer_it, is_active, priority, created_at, updated_at';
const MAX_FAQS = 20;
const MAX_TRIGGER_PHRASES = 20;
const MIN_TRIGGER_CHARS = 2;
const MAX_TRIGGER_CHARS = 160;
const MAX_TOPIC_CHARS = 80;
const MAX_ANSWER_CHARS = 1200;
const MIN_PRIORITY = 1;
const MAX_PRIORITY = 1000;

const DEFAULT_SETTINGS: AiReceptionistSettings = {
  reply_guidance: '',
  tone: 'concise',
  answer_length: 'short',
  email_gate_enabled: true,
  free_turns: 1,
  max_turns: 5,
};

function newFaq(priority: number): AiReceptionistFaq {
  return {
    id: crypto.randomUUID(),
    topic: '',
    trigger_phrases: [''],
    answer_en: '',
    answer_zh: '',
    answer_es: '',
    answer_fr: '',
    answer_de: '',
    answer_it: '',
    is_active: true,
    priority,
    created_at: null,
    updated_at: null,
  };
}

function normalizeFaq(value: Record<string, unknown>): AiReceptionistFaq {
  return {
    id: String(value.id || ''),
    topic: typeof value.topic === 'string' ? value.topic : '',
    trigger_phrases: Array.isArray(value.trigger_phrases)
      ? value.trigger_phrases.map((phrase) => String(phrase))
      : [''],
    answer_en: typeof value.answer_en === 'string' ? value.answer_en : '',
    answer_zh: typeof value.answer_zh === 'string' ? value.answer_zh : '',
    answer_es: typeof value.answer_es === 'string' ? value.answer_es : '',
    answer_fr: typeof value.answer_fr === 'string' ? value.answer_fr : '',
    answer_de: typeof value.answer_de === 'string' ? value.answer_de : '',
    answer_it: typeof value.answer_it === 'string' ? value.answer_it : '',
    is_active: Boolean(value.is_active),
    priority: Number.isInteger(Number(value.priority)) ? Number(value.priority) : 100,
    created_at: typeof value.created_at === 'string' ? value.created_at : null,
    updated_at: typeof value.updated_at === 'string' ? value.updated_at : null,
  };
}

function normalizedTriggerKey(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function normalizedTriggerPhrases(faq: AiReceptionistFaq): string[] {
  const seen = new Set<string>();
  return faq.trigger_phrases.reduce<string[]>((phrases, value) => {
    const phrase = value.trim();
    if (!phrase) return phrases;

    const key = normalizedTriggerKey(phrase);
    if (seen.has(key)) return phrases;

    seen.add(key);
    phrases.push(phrase);
    return phrases;
  }, []);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

export default function AdminAiSettings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AiReceptionistSettings>(DEFAULT_SETTINGS);
  const [faqs, setFaqs] = useState<AiReceptionistFaq[]>([]);
  const [deletedFaqIds, setDeletedFaqIds] = useState<string[]>([]);
  const [faqErrors, setFaqErrors] = useState<FaqErrors>({});
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const persistedFaqIdsRef = useRef(new Set<string>());
  const translationRef = useRef(t);

  useEffect(() => {
    translationRef.current = t;
  }, [t]);

  const updateSettings = (patch: Partial<AiReceptionistSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
    setNotice(null);
  };

  const updateFaq = (id: string, patch: Partial<AiReceptionistFaq>, field?: FaqField) => {
    setFaqs((current) => current.map((faq) => (faq.id === id ? { ...faq, ...patch } : faq)));
    if (field) {
      setFaqErrors((current) => {
        if (!current[id]?.[field]) return current;
        const nextFields = { ...current[id] };
        delete nextFields[field];
        const next = { ...current };
        if (Object.keys(nextFields).length === 0) delete next[id];
        else next[id] = nextFields;
        return next;
      });
    }
    setNotice(null);
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const [settingsResult, faqsResult] = await Promise.all([
        supabase
          .from('ai_receptionist_settings')
          .select(SETTINGS_COLUMNS)
          .eq('id', 1)
          .single(),
        supabase
          .from('ai_receptionist_faqs')
          .select(FAQ_COLUMNS)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: true }),
      ]);

      if (settingsResult.error) throw settingsResult.error;
      if (faqsResult.error) throw faqsResult.error;

      const data = settingsResult.data;
      const loadedFaqs = (faqsResult.data || []).map((faq) =>
        normalizeFaq(faq as Record<string, unknown>),
      );

      setSettings({
        reply_guidance: data.reply_guidance || '',
        tone: data.tone as ReceptionistTone,
        answer_length: data.answer_length as AnswerLength,
        email_gate_enabled: Boolean(data.email_gate_enabled),
        free_turns: Number(data.free_turns),
        max_turns: Number(data.max_turns),
      });
      setFaqs(loadedFaqs);
      setDeletedFaqIds([]);
      setFaqErrors({});
      setOpenFaqIds(new Set());
      persistedFaqIdsRef.current = new Set(loadedFaqs.map((faq) => faq.id));
      setLoaded(true);
    } catch (error: unknown) {
      setLoaded(false);
      setNotice({
        type: 'error',
        message: translationRef.current('admin.dashboard.settings.ai.loadError', {
          message: errorMessage(error),
          defaultValue: 'Could not load AI settings: {{message}}',
        }),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const addFaq = () => {
    if (faqs.length >= MAX_FAQS) {
      setNotice({
        type: 'error',
        message: t('admin.dashboard.settings.ai.faqLimitError', {
          defaultValue: 'You can save up to {{count}} standard answers.',
          count: MAX_FAQS,
        }),
      });
      return;
    }
    const highestPriority = faqs.reduce(
      (highest, faq) => Math.max(highest, faq.priority),
      90,
    );
    const faq = newFaq(Math.min(MAX_PRIORITY, highestPriority + 10));
    setFaqs((current) => [faq, ...current]);
    setOpenFaqIds((current) => new Set(current).add(faq.id));
    setNotice(null);
  };

  const deleteFaq = (faq: AiReceptionistFaq) => {
    const isPersisted = persistedFaqIdsRef.current.has(faq.id);
    if (
      isPersisted &&
      !window.confirm(
        t('admin.dashboard.settings.ai.faqDeleteConfirm', {
          defaultValue: 'Delete the standard answer “{{topic}}”? This takes effect when you save.',
          topic: faq.topic || t('admin.dashboard.settings.ai.faqUntitled', 'Untitled answer'),
        }),
      )
    ) {
      return;
    }

    setFaqs((current) => current.filter((item) => item.id !== faq.id));
    if (isPersisted) {
      setDeletedFaqIds((current) =>
        current.includes(faq.id) ? current : [...current, faq.id],
      );
    }
    setFaqErrors((current) => {
      if (!current[faq.id]) return current;
      const next = { ...current };
      delete next[faq.id];
      return next;
    });
    setOpenFaqIds((current) => {
      if (!current.has(faq.id)) return current;
      const next = new Set(current);
      next.delete(faq.id);
      return next;
    });
    setNotice(null);
  };

  const validateFaqs = (): FaqErrors => {
    const nextErrors: FaqErrors = {};

    faqs.forEach((faq) => {
      const errors: FaqFieldErrors = {};
      const topic = faq.topic.trim();
      const phrases = normalizedTriggerPhrases(faq);
      const answerEn = faq.answer_en.trim();

      if (topic.length < 1 || topic.length > MAX_TOPIC_CHARS) {
        errors.topic = t(
          'admin.dashboard.settings.ai.faqTopicError',
          'Topic must be between 1 and 80 characters.',
        );
      }
      if (
        phrases.length < 1 ||
        phrases.length > MAX_TRIGGER_PHRASES ||
        phrases.some(
          (phrase) =>
            phrase.length < MIN_TRIGGER_CHARS ||
            phrase.length > MAX_TRIGGER_CHARS ||
            normalizedTriggerKey(phrase).length === 0,
        )
      ) {
        errors.trigger_phrases = t(
          'admin.dashboard.settings.ai.faqTriggersError',
          'Add 1–20 unique trigger phrases, each 2–160 characters and containing a letter or number.',
        );
      }
      if (answerEn.length < 1 || answerEn.length > MAX_ANSWER_CHARS) {
        errors.answer_en = t(
          'admin.dashboard.settings.ai.faqEnglishError',
          'English answer is required and must be 1,200 characters or fewer.',
        );
      }
      if (faq.answer_zh.trim().length > MAX_ANSWER_CHARS) {
        errors.answer_zh = t(
          'admin.dashboard.settings.ai.faqChineseError',
          'Chinese answer must be 1,200 characters or fewer.',
        );
      }
      if (
        !Number.isInteger(faq.priority) ||
        faq.priority < MIN_PRIORITY ||
        faq.priority > MAX_PRIORITY
      ) {
        errors.priority = t(
          'admin.dashboard.settings.ai.faqPriorityError',
          'Priority must be a whole number from 1 to 1,000.',
        );
      }
      if (Object.keys(errors).length > 0) nextErrors[faq.id] = errors;
    });

    return nextErrors;
  };

  const saveSettings = async () => {
    const replyGuidance = settings.reply_guidance.trim();
    if (replyGuidance.length > 1200) {
      setNotice({
        type: 'error',
        message: t(
          'admin.dashboard.settings.ai.guidanceTooLong',
          'Reply guidance must be 1,200 characters or fewer.',
        ),
      });
      return;
    }

    if (faqs.length > MAX_FAQS) {
      setNotice({
        type: 'error',
        message: t('admin.dashboard.settings.ai.faqLimitError', {
          defaultValue: 'You can save up to {{count}} standard answers.',
          count: MAX_FAQS,
        }),
      });
      return;
    }

    const nextFaqErrors = validateFaqs();
    if (Object.keys(nextFaqErrors).length > 0) {
      setFaqErrors(nextFaqErrors);
      setOpenFaqIds((current) => {
        const next = new Set(current);
        Object.keys(nextFaqErrors).forEach((id) => next.add(id));
        return next;
      });
      setNotice({
        type: 'error',
        message: t(
          'admin.dashboard.settings.ai.faqValidationError',
          'Check the highlighted standard-answer fields before saving.',
        ),
      });
      const firstFaqId = Object.keys(nextFaqErrors)[0];
      window.requestAnimationFrame(() => {
        document.getElementById(`ai-faq-${firstFaqId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
      return;
    }
    if (
      !Number.isInteger(settings.free_turns) ||
      settings.free_turns < 1 ||
      settings.free_turns > 3
    ) {
      setNotice({
        type: 'error',
        message: t(
          'admin.dashboard.settings.ai.freeTurnsError',
          'Free turns must be a whole number from 1 to 3.',
        ),
      });
      return;
    }
    if (
      !Number.isInteger(settings.max_turns) ||
      settings.max_turns < 2 ||
      settings.max_turns > 10 ||
      settings.max_turns < settings.free_turns
    ) {
      setNotice({
        type: 'error',
        message: t(
          'admin.dashboard.settings.ai.maxTurnsError',
          'Maximum turns must be a whole number from 2 to 10 and cannot be lower than free turns.',
        ),
      });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const now = new Date().toISOString();
      const nextSettings: AiReceptionistSettings = {
        ...settings,
        reply_guidance: replyGuidance,
      };
      const normalizedFaqs = faqs.map((faq) => ({
        ...faq,
        topic: faq.topic.trim(),
        trigger_phrases: normalizedTriggerPhrases(faq),
        answer_en: faq.answer_en.trim(),
        answer_zh: faq.answer_zh.trim(),
        answer_es: faq.answer_es.trim(),
        answer_fr: faq.answer_fr.trim(),
        answer_de: faq.answer_de.trim(),
        answer_it: faq.answer_it.trim(),
      }));
      const { data, error } = await supabase
        .from('ai_receptionist_settings')
        .update({ ...nextSettings, updated_at: now })
        .eq('id', 1)
        .select(SETTINGS_COLUMNS)
        .single();

      if (error) throw error;

      if (normalizedFaqs.length > 0) {
        const { error: faqSaveError } = await supabase.from('ai_receptionist_faqs').upsert(
          normalizedFaqs.map((faq) => ({
            id: faq.id,
            topic: faq.topic,
            trigger_phrases: faq.trigger_phrases,
            answer_en: faq.answer_en,
            answer_zh: faq.answer_zh || null,
            answer_es: faq.answer_es || null,
            answer_fr: faq.answer_fr || null,
            answer_de: faq.answer_de || null,
            answer_it: faq.answer_it || null,
            is_active: faq.is_active,
            priority: faq.priority,
            updated_at: now,
          })),
          { onConflict: 'id' },
        );
        if (faqSaveError) throw faqSaveError;
      }

      if (deletedFaqIds.length > 0) {
        const { error: faqDeleteError } = await supabase
          .from('ai_receptionist_faqs')
          .delete()
          .in('id', deletedFaqIds);
        if (faqDeleteError) throw faqDeleteError;
      }

      setSettings({
        reply_guidance: data.reply_guidance || '',
        tone: data.tone as ReceptionistTone,
        answer_length: data.answer_length as AnswerLength,
        email_gate_enabled: Boolean(data.email_gate_enabled),
        free_turns: Number(data.free_turns),
        max_turns: Number(data.max_turns),
      });
      setFaqs(normalizedFaqs.map((faq) => ({ ...faq, updated_at: now })));
      setDeletedFaqIds([]);
      setFaqErrors({});
      persistedFaqIdsRef.current = new Set(normalizedFaqs.map((faq) => faq.id));
      setNotice({
        type: 'success',
        message: t('admin.dashboard.settings.ai.saveSuccess', 'AI receptionist settings saved.'),
      });
    } catch (error: unknown) {
      setNotice({
        type: 'error',
        message: t('admin.dashboard.settings.ai.saveError', {
          message: errorMessage(error),
          defaultValue: 'Could not save AI settings: {{message}}',
        }),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center rounded-2xl border border-stone-200 bg-white py-16 shadow-sm"
        role="status"
      >
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" aria-hidden="true" />
        <span className="sr-only">
          {t('admin.dashboard.settings.ai.loading', 'Loading AI settings')}
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900">
          <Bot className="h-5 w-5 text-stone-400" aria-hidden="true" />
          {t('admin.dashboard.settings.ai.title', 'AI receptionist')}
        </h3>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-stone-500">
          {t(
            'admin.dashboard.settings.ai.description',
            'Control how the assistant responds and when visitors must provide an email address to continue.',
          )}
        </p>
      </div>

      <div className="space-y-7 p-6">
        {notice && (
          <div
            role={notice.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-2 rounded-xl border p-4 text-sm font-medium ${
              notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>{notice.message}</span>
          </div>
        )}

        {!loaded ? (
          <button type="button" onClick={() => void loadSettings()} className={adminPrimaryBtn}>
            {t('admin.dashboard.settings.ai.retry', 'Try again')}
          </button>
        ) : (
          <fieldset
            disabled={saving}
            aria-busy={saving}
            className="min-w-0 space-y-7 border-0 p-0"
          >
            <section
              className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/70"
              aria-labelledby="ai-standard-answers-title"
            >
              <div className="flex flex-col gap-3 border-b border-stone-200 bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <MessageSquareText
                      className="h-4 w-4 shrink-0 text-stone-500"
                      aria-hidden="true"
                    />
                    <h4 id="ai-standard-answers-title" className="text-sm font-semibold text-stone-900">
                      {t('admin.dashboard.settings.ai.faqTitle', 'Standard answers')}
                    </h4>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-stone-600">
                      {faqs.length}/{MAX_FAQS}
                    </span>
                  </div>
                  <p className="mt-1.5 max-w-3xl text-xs leading-5 text-stone-500">
                    {t(
                      'admin.dashboard.settings.ai.faqDescription',
                      'Add approved answers for common buyer questions. English is required; Chinese is optional.',
                    )}
                  </p>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-stone-500">
                    {t(
                      'admin.dashboard.settings.ai.faqFallbackHelp',
                      'If Spanish, French, German, or Italian is blank, the website falls back to the English answer. Existing translations in those languages are preserved.',
                    )}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-stone-400">
                    {t(
                      'admin.dashboard.settings.ai.faqSaveHelp',
                      'New, edited, and deleted rules take effect after you save AI settings.',
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFaq}
                  disabled={faqs.length >= MAX_FAQS || saving}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('admin.dashboard.settings.ai.faqAdd', 'Add standard answer')}
                </button>
              </div>

              {faqs.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-stone-700">
                    {t('admin.dashboard.settings.ai.faqEmpty', 'No standard answers yet.')}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {t(
                      'admin.dashboard.settings.ai.faqEmptyHelp',
                      'Add one for questions such as minimum order quantity, customization, or lead time.',
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {faqs.map((faq, index) => {
                    const errors = faqErrors[faq.id] || {};
                    const triggerCount = normalizedTriggerPhrases(faq).length;
                    const hasErrors = Object.keys(errors).length > 0;
                    return (
                      <details
                        id={`ai-faq-${faq.id}`}
                        key={faq.id}
                        open={openFaqIds.has(faq.id)}
                        onToggle={(event) => {
                          const isOpen = event.currentTarget.open;
                          setOpenFaqIds((current) => {
                            if (current.has(faq.id) === isOpen) return current;
                            const next = new Set(current);
                            if (isOpen) next.add(faq.id);
                            else next.delete(faq.id);
                            return next;
                          });
                        }}
                        className={`group rounded-xl border bg-white ${
                          hasErrors ? 'border-red-300' : 'border-stone-200'
                        }`}
                      >
                        <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-900 [&::-webkit-details-marker]:hidden">
                          <span className="min-w-0 flex-1 truncate font-semibold text-stone-800">
                            {faq.topic.trim() ||
                              t('admin.dashboard.settings.ai.faqUntitled', 'Untitled answer')}
                          </span>
                          {hasErrors && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              {t('admin.dashboard.settings.ai.faqNeedsAttention', 'Needs attention')}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              faq.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {faq.is_active
                              ? t('admin.dashboard.settings.ai.faqActive', 'Active')
                              : t('admin.dashboard.settings.ai.faqInactive', 'Inactive')}
                          </span>
                          <span className="text-[10px] tabular-nums text-stone-400">
                            {t('admin.dashboard.settings.ai.faqRuleNumber', {
                              defaultValue: 'Rule {{number}}',
                              number: index + 1,
                            })}
                          </span>
                        </summary>

                        <div className="space-y-4 border-t border-stone-100 p-4">
                          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                            <div>
                              <label
                                htmlFor={`ai-faq-topic-${faq.id}`}
                                className="mb-1.5 block text-xs font-semibold text-stone-700"
                              >
                                {t('admin.dashboard.settings.ai.faqTopic', 'Topic')}
                              </label>
                              <input
                                id={`ai-faq-topic-${faq.id}`}
                                type="text"
                                required
                                maxLength={MAX_TOPIC_CHARS}
                                value={faq.topic}
                                onChange={(event) =>
                                  updateFaq(faq.id, { topic: event.target.value }, 'topic')
                                }
                                aria-invalid={Boolean(errors.topic)}
                                aria-describedby={errors.topic ? `ai-faq-topic-error-${faq.id}` : undefined}
                                placeholder={t(
                                  'admin.dashboard.settings.ai.faqTopicPlaceholder',
                                  'For example: MOQ',
                                )}
                                className="block h-10 w-full rounded-lg border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900"
                              />
                              {errors.topic && (
                                <p id={`ai-faq-topic-error-${faq.id}`} className="mt-1 text-xs text-red-700">
                                  {errors.topic}
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor={`ai-faq-priority-${faq.id}`}
                                className="mb-1.5 block text-xs font-semibold text-stone-700"
                              >
                                {t('admin.dashboard.settings.ai.faqPriority', 'Priority')}
                              </label>
                              <input
                                id={`ai-faq-priority-${faq.id}`}
                                type="number"
                                required
                                step={1}
                                min={MIN_PRIORITY}
                                max={MAX_PRIORITY}
                                value={faq.priority}
                                onChange={(event) =>
                                  updateFaq(
                                    faq.id,
                                    { priority: Number(event.target.value) },
                                    'priority',
                                  )
                                }
                                aria-invalid={Boolean(errors.priority)}
                                aria-describedby={`ai-faq-priority-help-${faq.id}${
                                  errors.priority ? ` ai-faq-priority-error-${faq.id}` : ''
                                }`}
                                className="block h-10 w-full rounded-lg border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900"
                              />
                              <p id={`ai-faq-priority-help-${faq.id}`} className="mt-1 text-[11px] text-stone-400">
                                {t(
                                  'admin.dashboard.settings.ai.faqPriorityHelp',
                                  '1–1,000; higher appears first.',
                                )}
                              </p>
                              {errors.priority && (
                                <p id={`ai-faq-priority-error-${faq.id}`} className="mt-1 text-xs text-red-700">
                                  {errors.priority}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="mb-1.5 flex items-end justify-between gap-3">
                              <label
                                htmlFor={`ai-faq-triggers-${faq.id}`}
                                className="text-xs font-semibold text-stone-700"
                              >
                                {t('admin.dashboard.settings.ai.faqTriggers', 'Trigger phrases')}
                              </label>
                              <span className="text-[11px] tabular-nums text-stone-400">
                                {triggerCount}/{MAX_TRIGGER_PHRASES}
                              </span>
                            </div>
                            <textarea
                              id={`ai-faq-triggers-${faq.id}`}
                              rows={3}
                              required
                              value={faq.trigger_phrases.join('\n')}
                              onChange={(event) =>
                                updateFaq(
                                  faq.id,
                                  { trigger_phrases: event.target.value.split(/\r?\n/) },
                                  'trigger_phrases',
                                )
                              }
                              aria-invalid={Boolean(errors.trigger_phrases)}
                              aria-describedby={`ai-faq-triggers-help-${faq.id}${
                                errors.trigger_phrases ? ` ai-faq-triggers-error-${faq.id}` : ''
                              }`}
                              placeholder={t(
                                'admin.dashboard.settings.ai.faqTriggersPlaceholder',
                                'What is your MOQ?\nminimum order quantity\nMOQ for LED mirrors',
                              )}
                              className="block w-full resize-y rounded-lg border-stone-200 bg-stone-50 px-3 py-2.5 text-sm leading-5 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900"
                            />
                            <p id={`ai-faq-triggers-help-${faq.id}`} className="mt-1 text-[11px] text-stone-500">
                              {t(
                                'admin.dashboard.settings.ai.faqTriggersHelp',
                                'Enter 1–20 phrases, one per line. Each must be 2–160 characters; case and punctuation variants are removed as duplicates when saved.',
                              )}
                            </p>
                            {errors.trigger_phrases && (
                              <p id={`ai-faq-triggers-error-${faq.id}`} className="mt-1 text-xs text-red-700">
                                {errors.trigger_phrases}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-4 lg:grid-cols-2">
                            <div>
                              <div className="mb-1.5 flex items-end justify-between gap-3">
                                <label
                                  htmlFor={`ai-faq-answer-en-${faq.id}`}
                                  className="text-xs font-semibold text-stone-700"
                                >
                                  {t('admin.dashboard.settings.ai.faqAnswerEnglish', 'English answer')}
                                  <span className="ml-1 text-red-600" aria-hidden="true">*</span>
                                </label>
                                <span className="text-[11px] tabular-nums text-stone-400">
                                  {faq.answer_en.length}/{MAX_ANSWER_CHARS}
                                </span>
                              </div>
                              <textarea
                                id={`ai-faq-answer-en-${faq.id}`}
                                rows={4}
                                required
                                maxLength={MAX_ANSWER_CHARS}
                                value={faq.answer_en}
                                onChange={(event) =>
                                  updateFaq(faq.id, { answer_en: event.target.value }, 'answer_en')
                                }
                                aria-invalid={Boolean(errors.answer_en)}
                                aria-describedby={
                                  errors.answer_en ? `ai-faq-answer-en-error-${faq.id}` : undefined
                                }
                                placeholder={t(
                                  'admin.dashboard.settings.ai.faqAnswerEnglishPlaceholder',
                                  'For eligible standard models, the MOQ is 5 units. Custom products require sales confirmation.',
                                )}
                                className="block w-full resize-y rounded-lg border-stone-200 bg-white px-3 py-2.5 text-sm leading-5 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                              />
                              {errors.answer_en && (
                                <p id={`ai-faq-answer-en-error-${faq.id}`} className="mt-1 text-xs text-red-700">
                                  {errors.answer_en}
                                </p>
                              )}
                            </div>

                            <div>
                              <div className="mb-1.5 flex items-end justify-between gap-3">
                                <label
                                  htmlFor={`ai-faq-answer-zh-${faq.id}`}
                                  className="text-xs font-semibold text-stone-700"
                                >
                                  {t('admin.dashboard.settings.ai.faqAnswerChinese', 'Chinese answer (optional)')}
                                </label>
                                <span className="text-[11px] tabular-nums text-stone-400">
                                  {faq.answer_zh.length}/{MAX_ANSWER_CHARS}
                                </span>
                              </div>
                              <textarea
                                id={`ai-faq-answer-zh-${faq.id}`}
                                rows={4}
                                maxLength={MAX_ANSWER_CHARS}
                                value={faq.answer_zh}
                                onChange={(event) =>
                                  updateFaq(faq.id, { answer_zh: event.target.value }, 'answer_zh')
                                }
                                aria-invalid={Boolean(errors.answer_zh)}
                                aria-describedby={`ai-faq-answer-zh-help-${faq.id}${
                                  errors.answer_zh ? ` ai-faq-answer-zh-error-${faq.id}` : ''
                                }`}
                                placeholder={t(
                                  'admin.dashboard.settings.ai.faqAnswerChinesePlaceholder',
                                  '符合条件的标准型号起订量为 5 件；定制产品需由销售确认。',
                                )}
                                className="block w-full resize-y rounded-lg border-stone-200 bg-white px-3 py-2.5 text-sm leading-5 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                              />
                              <p id={`ai-faq-answer-zh-help-${faq.id}`} className="mt-1 text-[11px] text-stone-500">
                                {t(
                                  'admin.dashboard.settings.ai.faqChineseFallback',
                                  'Leave blank to use the English answer on Chinese pages.',
                                )}
                              </p>
                              {errors.answer_zh && (
                                <p id={`ai-faq-answer-zh-error-${faq.id}`} className="mt-1 text-xs text-red-700">
                                  {errors.answer_zh}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 border-t border-stone-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-stone-700">
                              <input
                                type="checkbox"
                                checked={faq.is_active}
                                onChange={(event) =>
                                  updateFaq(faq.id, { is_active: event.target.checked })
                                }
                                className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                              />
                              {t('admin.dashboard.settings.ai.faqEnabled', 'Use this standard answer')}
                            </label>
                            <button
                              type="button"
                              onClick={() => deleteFaq(faq)}
                              disabled={saving}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              {t('admin.dashboard.settings.ai.faqDelete', 'Delete')}
                            </button>
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </section>

            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <label htmlFor="ai-reply-guidance" className="text-sm font-semibold text-stone-800">
                  {t('admin.dashboard.settings.ai.replyGuidance', 'Advanced reply guidance')}
                </label>
                <span className="text-xs tabular-nums text-stone-400">
                  {settings.reply_guidance.length}/1200
                </span>
              </div>
              <textarea
                id="ai-reply-guidance"
                rows={7}
                maxLength={1200}
                value={settings.reply_guidance}
                onChange={(event) => updateSettings({ reply_guidance: event.target.value })}
                placeholder={t(
                  'admin.dashboard.settings.ai.replyGuidancePlaceholder',
                  'Add qualification priorities or topics the assistant should emphasize. Put approved factual answers in Standard answers above. Do not enter private customer data.',
                )}
                className="block w-full resize-y rounded-xl border-stone-200 bg-stone-50 px-3.5 py-3 text-sm leading-6 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900"
              />
              <p className="mt-2 text-xs leading-relaxed text-stone-500">
                {t(
                  'admin.dashboard.settings.ai.replyGuidanceHelp',
                  'This guidance supplements the fixed safety rules. It cannot override privacy, quotation, or accuracy safeguards.',
                )}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-stone-800">
                  {t('admin.dashboard.settings.ai.tone', 'Tone')}
                </span>
                <select
                  value={settings.tone}
                  onChange={(event) =>
                    updateSettings({
                      tone: event.target.value as ReceptionistTone,
                    })
                  }
                  className="block w-full rounded-xl border-stone-200 bg-stone-50 px-3 py-2.5 text-sm focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900"
                >
                  <option value="concise">
                    {t('admin.dashboard.settings.ai.toneConcise', 'Concise')}
                  </option>
                  <option value="consultative">
                    {t('admin.dashboard.settings.ai.toneConsultative', 'Consultative')}
                  </option>
                  <option value="technical">
                    {t('admin.dashboard.settings.ai.toneTechnical', 'Technical')}
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-stone-800">
                  {t('admin.dashboard.settings.ai.answerLength', 'Answer length')}
                </span>
                <select
                  value={settings.answer_length}
                  onChange={(event) =>
                    updateSettings({
                      answer_length: event.target.value as AnswerLength,
                    })
                  }
                  className="block w-full rounded-xl border-stone-200 bg-stone-50 px-3 py-2.5 text-sm focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900"
                >
                  <option value="short">
                    {t('admin.dashboard.settings.ai.answerLengthShort', 'Short')}
                  </option>
                  <option value="medium">
                    {t('admin.dashboard.settings.ai.answerLengthMedium', 'Medium')}
                  </option>
                </select>
              </label>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={settings.email_gate_enabled}
                  onChange={(event) =>
                    updateSettings({
                      email_gate_enabled: event.target.checked,
                    })
                  }
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span>
                  <span className="block text-sm font-semibold text-stone-800">
                    {t('admin.dashboard.settings.ai.emailGate', 'Require email after free turns')}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-stone-500">
                    {t(
                      'admin.dashboard.settings.ai.emailGateHelp',
                      'Visitors can receive the configured number of free answers, then must submit an email address before continuing.',
                    )}
                  </span>
                </span>
              </label>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-800">
                    {t('admin.dashboard.settings.ai.freeTurns', 'Free turns')}
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={3}
                    step={1}
                    value={settings.free_turns}
                    onChange={(event) =>
                      updateSettings({
                        free_turns: Number(event.target.value),
                      })
                    }
                    className="block w-full rounded-xl border-stone-200 bg-white px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                  <span className="mt-1.5 block text-xs text-stone-400">
                    {t('admin.dashboard.settings.ai.freeTurnsRange', 'Allowed range: 1–3')}
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-800">
                    {t('admin.dashboard.settings.ai.maxTurns', 'Maximum turns')}
                  </span>
                  <input
                    type="number"
                    required
                    min={2}
                    max={10}
                    step={1}
                    value={settings.max_turns}
                    onChange={(event) =>
                      updateSettings({
                        max_turns: Number(event.target.value),
                      })
                    }
                    className="block w-full rounded-xl border-stone-200 bg-white px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                  <span className="mt-1.5 block text-xs text-stone-400">
                    {t('admin.dashboard.settings.ai.maxTurnsRange', 'Allowed range: 2–10')}
                  </span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-stone-600">
                    {t(
                      'admin.dashboard.settings.ai.maxTurnsClarification',
                      'This limits AI questions per visitor session. It does not set a product MOQ.',
                    )}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end border-t border-stone-100 pt-5">
              <button
                type="button"
                onClick={() => void saveSettings()}
                disabled={saving}
                className={adminPrimaryBtn}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {saving
                  ? t('admin.dashboard.settings.ai.saving', 'Saving…')
                  : t('admin.dashboard.settings.ai.save', 'Save AI settings')}
              </button>
            </div>
          </fieldset>
        )}
      </div>
    </div>
  );
}
