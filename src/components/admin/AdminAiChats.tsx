import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Clock3,
  Globe2,
  Loader2,
  Mail,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../supabase';
import {
  EmptyState,
  ResultMeta,
  SearchField,
  SectionHeader,
  StatusPill,
  Surface,
  Toolbar,
  adminSecondaryBtn,
} from './AdminUi';

type AiConversation = {
  id: string;
  session_id: string;
  language: 'en' | 'zh' | 'es' | 'fr' | 'de' | 'it';
  page_path: string;
  page_title: string | null;
  status: 'active' | 'qualified' | 'closed' | 'archived';
  message_count: number;
  created_at: string;
  last_message_at: string;
  retention_expires_at: string;
};

type AiMessage = {
  id: number;
  conversation_id: string;
  sequence_no: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type AiChatContact = {
  conversation_id: string;
  email: string;
  consented_at: string;
};

function formatDateTime(value: string, locale: string) {
  return new Date(value).toLocaleString(locale || undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortReference(sessionId: string) {
  return sessionId.length > 13 ? `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}` : sessionId;
}

export default function AdminAiChats() {
  const { t, i18n } = useTranslation();
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [contact, setContact] = useState<AiChatContact | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: queryError } = await supabase
      .from('ai_conversations')
      .select(
        'id,session_id,language,page_path,page_title,status,message_count,created_at,last_message_at,retention_expires_at',
      )
      .gt('retention_expires_at', new Date().toISOString())
      .order('last_message_at', { ascending: false })
      .limit(200);

    if (queryError) {
      console.error('Failed to load AI conversation summaries', queryError.code);
      setError(t('admin.aiChats.loadError', 'AI conversations could not be loaded.'));
      setConversations([]);
    } else {
      setConversations((data || []) as AiConversation[]);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (languageFilter !== 'all' && conversation.language !== languageFilter) return false;
      if (!query) return true;
      return [
        conversation.page_title || '',
        conversation.page_path,
        conversation.session_id,
        conversation.language,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [conversations, languageFilter, search]);

  useEffect(() => {
    if (!filteredConversations.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) =>
      current && filteredConversations.some((conversation) => conversation.id === current)
        ? current
        : filteredConversations[0].id,
    );
  }, [filteredConversations]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedId) {
      setMessages([]);
      setContact(null);
      return;
    }

    setError('');
    setMessagesLoading(true);
    setMessages([]);
    setContact(null);
    (async () => {
      const [messageResult, contactResult] = await Promise.all([
        supabase
          .from('ai_messages')
          .select('id,conversation_id,sequence_no,role,content,created_at')
          .eq('conversation_id', selectedId)
          .order('sequence_no', { ascending: true }),
        supabase
          .from('ai_chat_contacts')
          .select('conversation_id,email,consented_at')
          .eq('conversation_id', selectedId)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      if (messageResult.error) {
        console.error('Failed to load AI conversation messages', messageResult.error.code);
        setError(t('admin.aiChats.messagesError', 'This conversation could not be loaded.'));
        setMessages([]);
      } else {
        setMessages((messageResult.data || []) as AiMessage[]);
      }
      if (contactResult.error) {
        console.error('Failed to load AI chat contact', contactResult.error.code);
        setError(t('admin.aiChats.contactError', 'The contact details could not be loaded.'));
        setContact(null);
      } else {
        setContact((contactResult.data as AiChatContact | null) || null);
      }
      setMessagesLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, t]);

  const selectedConversation =
    filteredConversations.find((conversation) => conversation.id === selectedId) || null;

  return (
    <div>
      <SectionHeader
        title={t('admin.dashboard.tabs.aiChats', 'AI Chats')}
        subtitle={t(
          'admin.aiChats.subtitle',
          'Redacted transcripts and separately submitted follow-up emails are visible only to administrators and expire after 90 days.',
        )}
        action={
          <button type="button" onClick={() => void fetchConversations()} className={adminSecondaryBtn} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {t('admin.aiChats.refresh', 'Refresh')}
          </button>
        }
      />

      <Toolbar>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t('admin.aiChats.search', 'Search by page or conversation ID…')}
        />
        <select
          value={languageFilter}
          onChange={(event) => setLanguageFilter(event.target.value)}
          className="rounded-xl border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
          aria-label={t('admin.aiChats.languageFilter', 'Filter by language')}
        >
          <option value="all">{t('admin.aiChats.allLanguages', 'All languages')}</option>
          {['en', 'zh', 'es', 'fr', 'de', 'it'].map((language) => (
            <option key={language} value={language}>{language.toUpperCase()}</option>
          ))}
        </select>
        <ResultMeta
          shown={filteredConversations.length}
          total={conversations.length}
          label={t('admin.aiChats.conversations', 'conversations')}
        />
      </Toolbar>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <Surface className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-stone-400" aria-label={t('admin.aiChats.loading', 'Loading conversations')} />
        </Surface>
      ) : filteredConversations.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title={
            conversations.length === 0
              ? t('admin.aiChats.empty', 'No AI conversations have been recorded yet.')
              : t('admin.aiChats.noMatch', 'No conversations match these filters.')
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(290px,380px)_1fr] lg:items-start">
          <Surface className="max-h-[42vh] overflow-y-auto lg:sticky lg:top-4 lg:max-h-[calc(100dvh-13rem)]">
            <ul className="divide-y divide-stone-100">
              {filteredConversations.map((conversation) => {
                const selected = conversation.id === selectedId;
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(conversation.id)}
                      className={`w-full px-4 py-3.5 text-left transition-colors ${selected ? 'bg-amber-50' : 'hover:bg-stone-50'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate font-semibold text-stone-900">
                          {conversation.page_title || t('admin.aiChats.websiteChat', 'Website chat')}
                        </p>
                        <StatusPill tone={conversation.status === 'active' ? 'emerald' : 'stone'}>
                          {conversation.language.toUpperCase()}
                        </StatusPill>
                      </div>
                      <p className="mt-1 truncate text-sm text-stone-500">{conversation.page_path}</p>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-stone-400">
                        <span>{conversation.message_count} {t('admin.aiChats.messages', 'messages')}</span>
                        <span>{formatDateTime(conversation.last_message_at, i18n.language)}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Surface>

          <Surface className="min-h-80 p-5 sm:p-6">
            {selectedConversation ? (
              <div>
                <div className="border-b border-stone-100 pb-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-stone-900">
                        {selectedConversation.page_title || t('admin.aiChats.websiteChat', 'Website chat')}
                      </h2>
                      <p className="mt-1 break-all text-sm text-stone-500">{selectedConversation.page_path}</p>
                    </div>
                    <StatusPill tone="emerald">{t('admin.aiChats.redacted', 'Transcript redacted')}</StatusPill>
                  </div>
                  <dl className="mt-4 grid gap-2 text-xs text-stone-500 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-3.5 w-3.5 text-stone-400" />
                      <dt className="sr-only">{t('admin.aiChats.language', 'Language')}</dt>
                      <dd>{selectedConversation.language.toUpperCase()}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5 text-stone-400" />
                      <dt className="sr-only">{t('admin.aiChats.started', 'Started')}</dt>
                      <dd>{formatDateTime(selectedConversation.created_at, i18n.language)}</dd>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-stone-400" />
                      <dt>{t('admin.aiChats.reference', 'Conversation ID')}:</dt>
                      <dd className="font-mono" title={selectedConversation.session_id}>{shortReference(selectedConversation.session_id)}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                        {t('admin.aiChats.contactEmail', 'Follow-up email')}
                      </p>
                      {contact ? (
                        <>
                          <a
                            href={`mailto:${contact.email}`}
                            className="mt-1 block break-all text-sm font-semibold text-stone-900 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-700"
                          >
                            {contact.email}
                          </a>
                          <p className="mt-1 text-[11px] text-stone-400">
                            {t('admin.aiChats.consentedAt', 'Follow-up consent recorded')}: {' '}
                            {formatDateTime(contact.consented_at, i18n.language)}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-stone-500">
                          {t('admin.aiChats.noContactEmail', 'Not provided')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3" aria-live="polite">
                  {messagesLoading ? (
                    <div className="flex min-h-40 items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                    </div>
                  ) : messages.length === 0 ? (
                    <EmptyState icon={MessageSquareText} title={t('admin.aiChats.noMessages', 'No messages were stored for this conversation.')} embedded />
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'items-start gap-2.5'}`}
                      >
                        {message.role === 'assistant' && (
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                            <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        )}
                        <div className={`max-w-[88%] ${message.role === 'user' ? 'text-right' : ''}`}>
                          <p
                            className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-left text-sm leading-6 ${
                              message.role === 'user'
                                ? 'rounded-br-md bg-stone-900 text-white'
                                : 'rounded-tl-md border border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {message.content}
                          </p>
                          <time className="mt-1 block text-[10px] text-stone-400" dateTime={message.created_at}>
                            {formatDateTime(message.created_at, i18n.language)}
                          </time>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <EmptyState icon={MessageSquareText} title={t('admin.aiChats.select', 'Select a conversation to read it.')} embedded />
            )}
          </Surface>
        </div>
      )}
    </div>
  );
}
