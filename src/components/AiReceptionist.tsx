import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  Headphones,
  Loader2,
  Mail,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { trackEvent } from '../utils/analytics';

type ChatRole = 'user' | 'assistant';

type ApiMessage = {
  role: ChatRole;
  content: string;
};

type ChatMessage = ApiMessage & {
  id: number;
};

type PageContext = {
  path: string;
  title: string;
};

type TurnRequest = {
  messages: ApiMessage[];
  turnId: string;
  turnNumber: number;
};

type AccessPayload = {
  emailRequired: boolean;
  completedTurns: number;
  maxTurns: number;
};

type ChatSuccessPayload = {
  reply: string;
  recorded: true;
  access: AccessPayload;
};

type ContactSuccessPayload = {
  accepted: true;
  access: AccessPayload;
};

type PersistedAccessState = {
  version: 1;
  sessionId: string;
  completedTurns: number;
  emailAccepted: boolean;
  emailRequired: boolean;
};

const MAX_TRANSCRIPT_MESSAGES = 10;
const MAX_REQUEST_MESSAGES = 9;
const MAX_REQUEST_CHARS = 9_000;
const REQUEST_TIMEOUT_MS = 45_000;
const CONTACT_REQUEST_TIMEOUT_MS = 20_000;
const EMAIL_GATE_REVEAL_DELAY_MS = 1_200;
const SESSION_STORAGE_KEY = 'bolen.ai-receptionist.access.v1';
const SESSION_STATE_VERSION = 1;
const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function dropOldestTurn<T extends ApiMessage>(messages: T[]): T[] {
  const next = messages.slice();
  if (next[0]?.role === 'user') next.shift();
  if (next[0]?.role === 'assistant') next.shift();
  return next;
}

function trimTranscript<T extends ApiMessage>(messages: T[]): T[] {
  let next = messages.slice();
  while (next.length > MAX_TRANSCRIPT_MESSAGES) next = dropOldestTurn(next);
  if (next[0]?.role === 'assistant') next.shift();
  return next;
}

function prepareRequestMessages<T extends ApiMessage>(history: T[], userMessage: T): T[] {
  let next = [...history, userMessage];
  const totalChars = () => next.reduce((total, message) => total + message.content.length, 0);

  while (
    next.length > 1 &&
    (next.length > MAX_REQUEST_MESSAGES || totalChars() > MAX_REQUEST_CHARS)
  ) {
    next = dropOldestTurn(next);
  }

  if (next[0]?.role === 'assistant') next.shift();
  return next;
}

function isAccessPayload(value: unknown): value is AccessPayload {
  if (!value || typeof value !== 'object') return false;
  const access = value as Partial<AccessPayload>;
  return (
    typeof access.emailRequired === 'boolean' &&
    Number.isInteger(access.completedTurns) &&
    Number.isInteger(access.maxTurns) &&
    (access.completedTurns ?? -1) >= 0 &&
    (access.maxTurns ?? 0) > 0
  );
}

function isChatSuccessPayload(value: unknown): value is ChatSuccessPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Partial<ChatSuccessPayload>;
  return (
    typeof payload.reply === 'string' &&
    payload.recorded === true &&
    isAccessPayload(payload.access)
  );
}

function isContactSuccessPayload(value: unknown): value is ContactSuccessPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Partial<ContactSuccessPayload>;
  return payload.accepted === true && isAccessPayload(payload.access);
}

function readErrorCode(value: unknown): string {
  if (!value || typeof value !== 'object' || !('error' in value)) return '';
  const error = (value as { error?: unknown }).error;
  return typeof error === 'string' ? error : '';
}

function createUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function createInitialAccessState(): PersistedAccessState {
  const fallback: PersistedAccessState = {
    version: SESSION_STATE_VERSION,
    sessionId: createUuid(),
    completedTurns: 0,
    emailAccepted: false,
    emailRequired: false,
  };

  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return fallback;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return fallback;
    const stored = value as Partial<PersistedAccessState>;
    if (
      stored.version !== SESSION_STATE_VERSION ||
      typeof stored.sessionId !== 'string' ||
      !SESSION_ID_PATTERN.test(stored.sessionId) ||
      !Number.isInteger(stored.completedTurns) ||
      (stored.completedTurns ?? -1) < 0 ||
      typeof stored.emailAccepted !== 'boolean' ||
      typeof stored.emailRequired !== 'boolean'
    ) {
      return fallback;
    }
    return stored as PersistedAccessState;
  } catch {
    return fallback;
  }
}

function persistAccessState(state: PersistedAccessState): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Chat access state remains available in memory when storage is unavailable.
  }
}

function readPageContext(path: string): PageContext {
  const heading = document.querySelector<HTMLElement>('main h1')?.textContent?.trim();
  const socialTitle = document
    .querySelector<HTMLMetaElement>('meta[property="og:title"], meta[name="twitter:title"]')
    ?.content.trim();
  const title = (heading || socialTitle || document.title || 'BOLEN Mirror')
    .replace(/\s+/g, ' ')
    .slice(0, 200);

  return { path, title };
}

export default function AiReceptionist() {
  const { t } = useTranslation();
  const { lang, lp } = useLocalizedPath();
  const location = useLocation();
  const [initialAccess] = useState(createInitialAccessState);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [failedRequest, setFailedRequest] = useState<TurnRequest | null>(null);
  const [completedTurns, setCompletedTurns] = useState(initialAccess.completedTurns);
  const [maxTurns, setMaxTurns] = useState<number | null>(null);
  const [emailRequired, setEmailRequired] = useState(initialAccess.emailRequired);
  const [emailAccepted, setEmailAccepted] = useState(initialAccess.emailAccepted);
  const [emailGateReady, setEmailGateReady] = useState(initialAccess.emailRequired);
  const [sessionLimitReached, setSessionLimitReached] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [contactError, setContactError] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const contactSubmittingRef = useRef(false);
  const pendingGatedRequestRef = useRef<TurnRequest | null>(null);
  const nextMessageId = useRef(0);
  const nextTurnNumber = useRef(initialAccess.completedTurns);
  const sessionIdRef = useRef(initialAccess.sessionId);

  const copy = (key: string, defaultValue: string) =>
    t(`aiReceptionist.${key}`, { defaultValue });

  const isProductDetail = /^\/(?:en|zh|es|fr|de|it)\/products\/(?!category(?:\/|$))[^/]+\/?$/.test(
    location.pathname,
  );

  const quickQuestions = [
    copy('quickProduct', 'Which mirror is right for my project?'),
    copy('quickMoq', 'What is your minimum order quantity?'),
    copy('quickCustomization', 'What can I customize?'),
    copy('quickLeadTime', 'What are your sample and production lead times?'),
  ];

  const hasReachedTurnLimit =
    sessionLimitReached || (maxTurns !== null && completedTurns >= maxTurns);
  const emailGateActive = emailRequired && !emailAccepted && !hasReachedTurnLimit;
  const showEmailGate = emailGateActive && emailGateReady;

  const closeChat = (returnFocus = true) => {
    abortRef.current?.abort();
    abortRef.current = null;
    sendingRef.current = false;
    contactSubmittingRef.current = false;
    setIsSending(false);
    setIsSubmittingContact(false);
    setIsOpen(false);
    if (returnFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => {
      if (!emailGateActive && !hasReachedTurnLimit && !isSending) {
        inputRef.current?.focus();
      }
    });
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') closeChat();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [emailGateActive, hasReachedTurnLimit, isOpen, isSending]);

  useEffect(() => {
    if (!isOpen) return;
    const list = messageListRef.current;
    if (!list) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({ top: list.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [error, isOpen, isSending, messages]);

  useEffect(() => {
    if (!isOpen || !showEmailGate) return;
    const frame = window.requestAnimationFrame(() => {
      const list = messageListRef.current;
      if (!list) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      list.scrollTo({ top: list.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [contactError, isOpen, showEmailGate]);

  useEffect(() => {
    if (!emailGateActive) {
      setEmailGateReady(false);
      return;
    }
    if (emailGateReady) return;

    const timeoutId = window.setTimeout(() => {
      setEmailGateReady(true);
    }, EMAIL_GATE_REVEAL_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [emailGateActive, emailGateReady]);

  useEffect(() => {
    persistAccessState({
      version: SESSION_STATE_VERSION,
      sessionId: sessionIdRef.current,
      completedTurns,
      emailAccepted,
      emailRequired,
    });
  }, [completedTurns, emailAccepted, emailRequired]);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    sendingRef.current = false;
    contactSubmittingRef.current = false;
    setIsSending(false);
    setIsSubmittingContact(false);
    setError('');
    setFailedRequest(null);
    setContactError('');
    setContactEmail('');
    setContactConsent(false);
    pendingGatedRequestRef.current = null;
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
      sendingRef.current = false;
      contactSubmittingRef.current = false;
    },
    [],
  );

  const requestReply = async (turnRequest: TurnRequest) => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    sendingRef.current = true;
    setIsSending(true);
    setError('');
    setFailedRequest(null);
    pendingGatedRequestRef.current = null;

    let didTimeOut = false;
    const timeoutId = window.setTimeout(() => {
      didTimeOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('/api/ai-receptionist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-Session': sessionIdRef.current,
        },
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({
          messages: turnRequest.messages,
          language: lang,
          page: readPageContext(location.pathname),
          turnId: turnRequest.turnId,
          turnNumber: turnRequest.turnNumber,
        }),
      });

      const payload: unknown = await response.json().catch(() => null);
      if (abortRef.current !== controller) return;

      if (!response.ok) {
        const errorCode = readErrorCode(payload);
        if (errorCode === 'EMAIL_REQUIRED') {
          pendingGatedRequestRef.current = turnRequest;
          setEmailAccepted(false);
          setEmailRequired(true);
          setEmailGateReady(true);
          setError('');
          setFailedRequest(null);
          return;
        }
        if (errorCode === 'SESSION_TURN_LIMIT_REACHED') {
          setSessionLimitReached(true);
          setEmailRequired(false);
          setError(
            copy(
              'turnLimitReached',
              'You have reached the AI question limit for this session. Our sales team can continue helping you.',
            ),
          );
          setFailedRequest(null);
          return;
        }
        throw new Error(`AI receptionist returned ${response.status}`);
      }

      if (!isChatSuccessPayload(payload) || !payload.reply.trim()) {
        throw new Error('AI receptionist returned an invalid response');
      }

      const reply: ChatMessage = {
        id: ++nextMessageId.current,
        role: 'assistant',
        content: payload.reply.trim(),
      };
      nextTurnNumber.current = payload.access.completedTurns;
      setCompletedTurns(payload.access.completedTurns);
      setMaxTurns(payload.access.maxTurns);
      setSessionLimitReached(payload.access.completedTurns >= payload.access.maxTurns);
      setEmailRequired(payload.access.emailRequired);
      if (payload.access.emailRequired) {
        setEmailAccepted(false);
        setEmailGateReady(false);
      }
      setMessages((current) => trimTranscript([...current, reply]));
    } catch (requestError) {
      if (abortRef.current !== controller) return;
      if (controller.signal.aborted && !didTimeOut) return;
      console.error('AI receptionist request failed', requestError);
      setError(
        didTimeOut
          ? copy('timeoutError', 'The response took too long. Please try again.')
          : copy('error', 'I could not respond just now. Please try again.'),
      );
      setFailedRequest(turnRequest);
    } finally {
      window.clearTimeout(timeoutId);
      if (abortRef.current === controller) {
        abortRef.current = null;
        sendingRef.current = false;
        setIsSending(false);
      }
    }
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (contactSubmittingRef.current) return;

    const email = contactEmail.trim();
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      setContactError(copy('emailInvalid', 'Enter a valid email address.'));
      emailInputRef.current?.focus();
      return;
    }
    if (!contactConsent) {
      setContactError(
        copy('emailConsentRequired', 'Please confirm that we may use your email to follow up.'),
      );
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    contactSubmittingRef.current = true;
    setIsSubmittingContact(true);
    setContactError('');

    let didTimeOut = false;
    let requestToResume: TurnRequest | null = null;
    const timeoutId = window.setTimeout(() => {
      didTimeOut = true;
      controller.abort();
    }, CONTACT_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('/api/ai-receptionist/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-Session': sessionIdRef.current,
        },
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({ email, consent: true }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (abortRef.current !== controller) return;

      if (!response.ok) {
        if (readErrorCode(payload) === 'SESSION_TURN_LIMIT_REACHED') {
          setSessionLimitReached(true);
          setEmailRequired(false);
          setContactEmail('');
          setContactError(
            copy(
              'turnLimitReached',
              'You have reached the AI question limit for this session. Our sales team can continue helping you.',
            ),
          );
          return;
        }
        throw new Error(`AI receptionist contact returned ${response.status}`);
      }
      if (!isContactSuccessPayload(payload)) {
        throw new Error('AI receptionist contact returned an invalid response');
      }

      nextTurnNumber.current = payload.access.completedTurns;
      setCompletedTurns(payload.access.completedTurns);
      setMaxTurns(payload.access.maxTurns);
      setSessionLimitReached(payload.access.completedTurns >= payload.access.maxTurns);
      setEmailAccepted(true);
      setEmailRequired(false);
      setEmailGateReady(false);
      setContactEmail('');
      setContactConsent(false);
      setContactError('');

      const pendingRequest = pendingGatedRequestRef.current;
      pendingGatedRequestRef.current = null;
      if (pendingRequest && payload.access.completedTurns < payload.access.maxTurns) {
        requestToResume = {
          ...pendingRequest,
          turnNumber: payload.access.completedTurns + 1,
        };
      }
    } catch {
      if (abortRef.current !== controller) return;
      if (controller.signal.aborted && !didTimeOut) return;
      setContactError(
        didTimeOut
          ? copy('emailTimeoutError', 'Saving your email took too long. Please try again.')
          : copy('emailSubmitError', 'We could not save your email just now. Please try again.'),
      );
    } finally {
      window.clearTimeout(timeoutId);
      if (abortRef.current === controller) {
        abortRef.current = null;
        contactSubmittingRef.current = false;
        setIsSubmittingContact(false);
      }
    }

    if (requestToResume) {
      void requestReply(requestToResume);
    } else {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const sendQuestion = (question: string) => {
    const content = question.trim();
    if (!content || sendingRef.current || emailGateActive || hasReachedTurnLimit) return;

    const userMessage: ChatMessage = {
      id: ++nextMessageId.current,
      role: 'user',
      content,
    };
    // If the previous request failed, replace that unanswered user turn instead
    // of sending two consecutive user roles, which the Worker intentionally rejects.
    const answeredHistory = messages.at(-1)?.role === 'user' ? messages.slice(0, -1) : messages;
    const nextMessages = prepareRequestMessages(answeredHistory, userMessage);
    trackEvent('ai_chat_message', {
      language: lang,
      page_type: isProductDetail ? 'product_detail' : 'public_page',
      message_number: nextMessages.filter((message) => message.role === 'user').length,
    });
    setMessages(nextMessages);
    setDraft('');
    void requestReply({
      messages: nextMessages.map(({ role, content: messageContent }) => ({
        role,
        content: messageContent,
      })),
      turnId: createUuid(),
      turnNumber: nextTurnNumber.current + 1,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuestion(draft);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      sendQuestion(draft);
    }
  };

  if (location.pathname.startsWith('/admin')) return null;

  const mobileBottom = isProductDetail
    ? 'bottom-[calc(6.5rem+env(safe-area-inset-bottom))]'
    : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]';

  return (
    <div className={`fixed right-3 z-[70] sm:right-5 lg:bottom-6 lg:right-6 ${mobileBottom}`}>
      {isOpen ? (
        <section
          id="ai-receptionist-dialog"
          role="dialog"
          aria-modal="false"
          aria-labelledby="ai-receptionist-title"
          className={`flex h-[min(38rem,calc(100dvh-2rem))] w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-stone-200 bg-[#FAF9F6] shadow-2xl shadow-stone-950/20 lg:max-h-[calc(100dvh-3rem)] ${
            isProductDetail ? 'max-h-[calc(100dvh-8.5rem)]' : 'max-h-[calc(100dvh-2rem)]'
          }`}
        >
          <header className="relative shrink-0 overflow-hidden bg-stone-900 px-5 py-4 text-white">
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-amber-500/15 blur-2xl" />
            <div className="relative flex items-center gap-3 pr-10">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-stone-950 shadow-sm">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 id="ai-receptionist-title" className="truncate font-serif text-lg font-semibold">
                    {copy('title', 'BOLEN AI Assistant')}
                  </h2>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span className="sr-only">{copy('available', 'Available')}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-stone-300">
                  {copy('subtitle', 'Product guidance for global buyers')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => closeChat()}
              className="absolute right-3 top-3 rounded-full p-2 text-stone-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label={copy('closeLabel', 'Close AI assistant')}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div
            ref={messageListRef}
            className="min-h-0 flex-1 overflow-y-auto px-4 py-5"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-busy={isSending}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <p className="max-w-[82%] rounded-2xl rounded-tl-md border border-stone-200 bg-white px-3.5 py-2.5 text-sm leading-6 text-stone-700 shadow-sm">
                {copy(
                  'greeting',
                  'Hello! I can help with product selection, MOQ, customization and lead times.',
                )}
              </p>
            </div>

            {messages.length === 0 && !emailGateActive && !hasReachedTurnLimit && (
              <div className="ml-9 mt-4" aria-label={copy('quickQuestionsLabel', 'Suggested questions')}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  {copy('quickQuestions', 'Quick questions')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendQuestion(question)}
                      disabled={isSending}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-left text-xs font-medium leading-5 text-amber-900 transition-colors hover:border-amber-300 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'items-start gap-2.5'}`}
                >
                  {message.role === 'assistant' && (
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                      <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  )}
                  <p
                    className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-stone-900 text-white'
                        : 'rounded-tl-md border border-stone-200 bg-white text-stone-700 shadow-sm'
                    }`}
                  >
                    <span className="sr-only">
                      {message.role === 'user'
                        ? copy('youLabel', 'You')
                        : copy('assistantLabel', 'AI assistant')}
                      :{' '}
                    </span>
                    {message.content}
                  </p>
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2.5 text-stone-500">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                    <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-2xl rounded-tl-md border border-stone-200 bg-white px-3.5 py-2.5 text-xs shadow-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    {copy('thinking', 'Thinking…')}
                  </span>
                </div>
              )}

              {error && (
                <div className="ml-9 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">
                  <p>{error}</p>
                  {failedRequest && (
                    <button
                      type="button"
                      onClick={() => void requestReply(failedRequest)}
                      disabled={isSending}
                      className="mt-2 inline-flex items-center gap-1.5 font-semibold text-red-900 underline decoration-red-300 underline-offset-2 hover:decoration-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      {copy('retry', 'Try again')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-stone-200 bg-white px-4 pb-3 pt-3">
            {!emailGateActive && (
              <Link
                to={lp('/rfq')}
                onClick={() => {
                  trackEvent('ai_chat_handoff', {
                    language: lang,
                    page_type: isProductDetail ? 'product_detail' : 'public_page',
                  });
                  closeChat(false);
                }}
                className="mb-3 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <span className="inline-flex items-center gap-2">
                  <Headphones className="h-4 w-4" aria-hidden="true" />
                  {copy('humanCta', 'Request a quote from our sales team')}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            )}

            {emailGateActive ? (
              !showEmailGate ? null : (
                <form
                  id="ai-receptionist-email-gate-form"
                  onSubmit={handleContactSubmit}
                  className="rounded-xl border border-amber-200 bg-amber-50/60 p-2"
                  aria-busy={isSubmittingContact}
                  aria-label={copy('emailGateTitle', 'Continue the conversation')}
                >
                  <p id="ai-receptionist-email-gate-description" className="sr-only">
                    {maxTurns !== null
                      ? t('aiReceptionist.emailGateDescriptionWithLimit', {
                          defaultValue:
                            'You received your first AI reply. Enter your email to continue, with up to {{maxTurns}} AI questions in this session.',
                          maxTurns,
                        })
                      : copy(
                          'emailGateDescription',
                          'You received your first AI reply. Enter your email to continue this conversation.',
                        )}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 transition-colors focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200">
                      <Mail className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                      <label htmlFor="ai-receptionist-contact-email" className="sr-only">
                        {copy('emailLabel', 'Email address')}
                      </label>
                      <input
                        ref={emailInputRef}
                        id="ai-receptionist-contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        maxLength={254}
                        required
                        value={contactEmail}
                        onChange={(event) => {
                          setContactEmail(event.target.value);
                          setContactError('');
                        }}
                        disabled={isSubmittingContact}
                        aria-invalid={Boolean(contactError)}
                        aria-describedby={`ai-receptionist-email-gate-description ai-receptionist-contact-consent ai-receptionist-privacy-note${
                          contactError ? ' ai-receptionist-contact-error' : ''
                        }`}
                        placeholder={copy('emailCompactPlaceholder', 'Work email to continue')}
                        className="h-full min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!contactEmail.trim() || !contactConsent || isSubmittingContact}
                      className="flex h-10 min-w-[5.25rem] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
                      aria-label={
                        isSubmittingContact
                          ? copy('emailSubmitting', 'Saving…')
                          : copy('emailContinue', 'Continue with email')
                      }
                    >
                      {isSubmittingContact ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : null}
                      <span>
                        {isSubmittingContact
                          ? copy('emailSubmitting', 'Saving…')
                          : copy('emailContinueShort', 'Continue')}
                      </span>
                    </button>
                  </div>

                  <label className="mt-1.5 flex cursor-pointer items-start gap-1.5 text-[10px] leading-3.5 text-stone-600">
                    <input
                      type="checkbox"
                      required
                      checked={contactConsent}
                      onChange={(event) => {
                        setContactConsent(event.target.checked);
                        setContactError('');
                      }}
                      disabled={isSubmittingContact}
                      className="mt-px h-3.5 w-3.5 shrink-0 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span id="ai-receptionist-contact-consent">
                      {copy(
                        'emailConsentCompact',
                        'I agree to email follow-up and linking this email to this chat for up to 90 days.',
                      )}
                    </span>
                  </label>

                  {contactError && (
                    <p
                      id="ai-receptionist-contact-error"
                      className="mt-1.5 text-[11px] font-medium leading-4 text-red-700"
                      role="alert"
                    >
                      {contactError}
                    </p>
                  )}
                </form>
              )
            ) : hasReachedTurnLimit ? (
              <div
                className="rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-sm text-stone-700"
                role="status"
              >
                <p className="font-semibold text-stone-900">
                  {copy('turnLimitTitle', 'AI question limit reached')}
                </p>
                <p className="mt-1 text-xs leading-5">
                  {maxTurns !== null
                    ? t('aiReceptionist.turnLimitDescriptionWithLimit', {
                        defaultValue:
                          'This session includes up to {{maxTurns}} AI questions. Please contact our sales team for more help.',
                        maxTurns,
                      })
                    : copy(
                        'turnLimitDescription',
                        'Please contact our sales team to continue this conversation.',
                      )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <label htmlFor="ai-receptionist-input" className="sr-only">
                  {copy('inputLabel', 'Message the AI assistant')}
                </label>
                <textarea
                  ref={inputRef}
                  id="ai-receptionist-input"
                  rows={1}
                  maxLength={1200}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  disabled={isSending}
                  aria-describedby={
                    maxTurns !== null
                      ? 'ai-receptionist-turn-note ai-receptionist-privacy-note'
                      : 'ai-receptionist-privacy-note'
                  }
                  placeholder={copy('placeholder', 'Ask about products, MOQ or customization…')}
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm leading-5 text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isSending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-colors hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
                  aria-label={copy('sendLabel', 'Send message')}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </form>
            )}
            {maxTurns !== null && !emailGateActive && !hasReachedTurnLimit && (
              <p
                id="ai-receptionist-turn-note"
                className="mt-2 text-center text-[10px] leading-4 text-stone-500"
              >
                {t('aiReceptionist.turnUsage', {
                  defaultValue: 'AI questions used: {{completedTurns}} of {{maxTurns}}.',
                  completedTurns,
                  maxTurns,
                })}
              </p>
            )}
            <p
              id="ai-receptionist-privacy-note"
              className={`text-center text-[10px] text-stone-400 ${
                emailGateActive ? 'mt-1.5 leading-3.5' : 'mt-2 leading-4'
              }`}
            >
              {emailGateActive
                ? copy(
                    'privacyNoteCompact',
                    'Redacted chat is stored for up to 90 days. Do not enter sensitive information.',
                  )
                : copy(
                    'privacyNote',
                    'We store an automatically redacted copy of this AI chat for up to 90 days. Do not type contact, ID, payment, or account details into chat. An email submitted through the separate continuation form is stored with your consent and is visible only to authorized administrators.',
                  )}{' '}
              <a
                href="mailto:bolen2@cnjxctm.com?subject=AI%20chat%20privacy%20request"
                className="font-medium text-stone-500 underline decoration-stone-300 underline-offset-2 hover:text-stone-700"
              >
                {copy('privacyContact', 'Privacy request')}
              </a>
            </p>
          </div>
        </section>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            trackEvent('ai_chat_open', {
              language: lang,
              page_type: isProductDetail ? 'product_detail' : 'public_page',
            });
            setIsOpen(true);
          }}
          className="group flex h-14 items-center gap-2 rounded-full bg-stone-900 px-4 text-white shadow-xl shadow-stone-950/25 transition-all hover:-translate-y-0.5 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          aria-label={copy('openLabel', 'Open BOLEN AI assistant')}
          aria-haspopup="dialog"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-stone-950">
            <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-stone-900 bg-emerald-400" aria-hidden="true" />
          </span>
          <span className="hidden pr-1 text-sm font-semibold sm:inline">
            {copy('buttonText', 'Ask AI')}
          </span>
        </button>
      )}
    </div>
  );
}
