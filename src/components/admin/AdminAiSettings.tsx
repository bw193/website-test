import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Bot, CheckCircle2, Loader2, Save } from 'lucide-react';
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

type Notice = { type: 'success' | 'error'; message: string } | null;

const SETTINGS_COLUMNS =
  'reply_guidance, tone, answer_length, email_gate_enabled, free_turns, max_turns';

const DEFAULT_SETTINGS: AiReceptionistSettings = {
  reply_guidance: '',
  tone: 'concise',
  answer_length: 'short',
  email_gate_enabled: true,
  free_turns: 1,
  max_turns: 5,
};

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const { data, error } = await supabase
        .from('ai_receptionist_settings')
        .select(SETTINGS_COLUMNS)
        .eq('id', 1)
        .single();

      if (error) throw error;

      setSettings({
        reply_guidance: data.reply_guidance || '',
        tone: data.tone as ReceptionistTone,
        answer_length: data.answer_length as AnswerLength,
        email_gate_enabled: Boolean(data.email_gate_enabled),
        free_turns: Number(data.free_turns),
        max_turns: Number(data.max_turns),
      });
      setLoaded(true);
    } catch (error: unknown) {
      setLoaded(false);
      setNotice({
        type: 'error',
        message: t('admin.dashboard.settings.ai.loadError', {
          message: errorMessage(error),
          defaultValue: 'Could not load AI settings: {{message}}',
        }),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

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
    if (settings.free_turns < 1 || settings.free_turns > 3) {
      setNotice({
        type: 'error',
        message: t('admin.dashboard.settings.ai.freeTurnsError', 'Free turns must be between 1 and 3.'),
      });
      return;
    }
    if (
      settings.max_turns < 2 ||
      settings.max_turns > 10 ||
      settings.max_turns < settings.free_turns
    ) {
      setNotice({
        type: 'error',
        message: t(
          'admin.dashboard.settings.ai.maxTurnsError',
          'Maximum turns must be between 2 and 10 and cannot be lower than free turns.',
        ),
      });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const nextSettings: AiReceptionistSettings = {
        ...settings,
        reply_guidance: replyGuidance,
      };
      const { data, error } = await supabase
        .from('ai_receptionist_settings')
        .update({ ...nextSettings, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select(SETTINGS_COLUMNS)
        .single();

      if (error) throw error;

      setSettings({
        reply_guidance: data.reply_guidance || '',
        tone: data.tone as ReceptionistTone,
        answer_length: data.answer_length as AnswerLength,
        email_gate_enabled: Boolean(data.email_gate_enabled),
        free_turns: Number(data.free_turns),
        max_turns: Number(data.max_turns),
      });
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
      <div className="flex justify-center rounded-2xl border border-stone-200 bg-white py-16 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900">
          <Bot className="h-5 w-5 text-stone-400" />
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
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
        )}

        {!loaded ? (
          <button type="button" onClick={() => void loadSettings()} className={adminPrimaryBtn}>
            {t('admin.dashboard.settings.ai.retry', 'Try again')}
          </button>
        ) : (
          <>
            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <label htmlFor="ai-reply-guidance" className="text-sm font-semibold text-stone-800">
                  {t('admin.dashboard.settings.ai.replyGuidance', 'Reply guidance')}
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
                onChange={(event) =>
                  setSettings((current) => ({ ...current, reply_guidance: event.target.value }))
                }
                placeholder={t(
                  'admin.dashboard.settings.ai.replyGuidancePlaceholder',
                  'Add approved product facts, qualification priorities, and topics the assistant should emphasize. Do not enter private customer data.',
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
                    setSettings((current) => ({
                      ...current,
                      tone: event.target.value as ReceptionistTone,
                    }))
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
                    setSettings((current) => ({
                      ...current,
                      answer_length: event.target.value as AnswerLength,
                    }))
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
                    setSettings((current) => ({
                      ...current,
                      email_gate_enabled: event.target.checked,
                    }))
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
                    min={1}
                    max={3}
                    step={1}
                    value={settings.free_turns}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        free_turns: Number(event.target.value),
                      }))
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
                    min={2}
                    max={10}
                    step={1}
                    value={settings.max_turns}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        max_turns: Number(event.target.value),
                      }))
                    }
                    className="block w-full rounded-xl border-stone-200 bg-white px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                  <span className="mt-1.5 block text-xs text-stone-400">
                    {t('admin.dashboard.settings.ai.maxTurnsRange', 'Allowed range: 2–10')}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saving
                  ? t('admin.dashboard.settings.ai.saving', 'Saving…')
                  : t('admin.dashboard.settings.ai.save', 'Save AI settings')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
