import baseWorker, { type Env } from './index.ts';

const AI_API_PATH = '/api/ai-receptionist';
const FALLBACK_AI_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';
const MIN_PRIMARY_OUTPUT_TOKENS = 768;
const MIN_FALLBACK_OUTPUT_TOKENS = 512;

type AiInput = Parameters<Env['AI']['run']>[1];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringFromContent(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return null;

  const parts = value
    .map((part) => {
      if (typeof part === 'string') return part;
      if (!isRecord(part)) return '';
      if (typeof part.text === 'string') return part.text;
      if (typeof part.content === 'string') return part.content;
      return '';
    })
    .filter(Boolean);

  return parts.length ? parts.join('\n') : null;
}

function extractText(result: unknown): string | null {
  if (!isRecord(result)) return null;
  if (typeof result.response === 'string') return result.response;
  if (typeof result.text === 'string') return result.text;

  if (Array.isArray(result.choices) && result.choices.length > 0) {
    const choice = result.choices[0];
    if (!isRecord(choice)) return null;
    if (typeof choice.text === 'string') return choice.text;
    if (isRecord(choice.message)) return stringFromContent(choice.message.content);
  }

  return null;
}

function hasVisibleReply(result: unknown): boolean {
  const text = extractText(result);
  if (!text) return false;

  return Boolean(
    text
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<think>[\s\S]*$/gi, '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim(),
  );
}

function safeDiagnostic(error: unknown): { status?: string; code?: string } {
  const record = isRecord(error) ? error : {};
  const sanitize = (value: unknown): string | undefined => {
    if (typeof value !== 'string' && typeof value !== 'number') return undefined;
    const text = String(value).trim();
    return /^[A-Za-z0-9_.:-]{1,32}$/.test(text) ? text : undefined;
  };

  return {
    ...(sanitize(record.status ?? record.statusCode)
      ? { status: sanitize(record.status ?? record.statusCode) }
      : {}),
    ...(sanitize(record.code) ? { code: sanitize(record.code) } : {}),
  };
}

function combinedAiError(primaryError: unknown, fallbackError: unknown): Error {
  const primary = safeDiagnostic(primaryError);
  const fallback = safeDiagnostic(fallbackError);
  return Object.assign(new Error('503 Workers AI models unavailable'), {
    status: 503,
    code: fallback.code || primary.code || 'AI_MODELS_UNAVAILABLE',
  });
}

function withReliableAi(env: Env): Env {
  const run = env.AI.run.bind(env.AI);

  return {
    ...env,
    AI: {
      run: async (model: string, input: AiInput): Promise<unknown> => {
        const primaryInput: AiInput = {
          ...input,
          max_tokens: Math.max(input.max_tokens, MIN_PRIMARY_OUTPUT_TOKENS),
        };
        let primaryError: unknown;

        try {
          const primaryResult = await run(model, primaryInput);
          if (hasVisibleReply(primaryResult)) return primaryResult;
          primaryError = Object.assign(new Error('AI_PRIMARY_INVALID_RESPONSE'), {
            status: 502,
            code: 'AI_PRIMARY_INVALID_RESPONSE',
          });
          console.warn('Workers AI primary model returned no visible answer; using fallback');
        } catch (error) {
          primaryError = error;
          console.warn('Workers AI primary model failed; using fallback', safeDiagnostic(error));
        }

        try {
          const fallbackResult = await run(FALLBACK_AI_MODEL, {
            ...input,
            max_tokens: Math.max(input.max_tokens, MIN_FALLBACK_OUTPUT_TOKENS),
          });
          if (!hasVisibleReply(fallbackResult)) {
            throw Object.assign(new Error('AI_FALLBACK_INVALID_RESPONSE'), {
              status: 502,
              code: 'AI_FALLBACK_INVALID_RESPONSE',
            });
          }
          console.info('Workers AI fallback model served the response');
          return fallbackResult;
        } catch (fallbackError) {
          console.error('Workers AI fallback model failed', safeDiagnostic(fallbackError));
          throw combinedAiError(primaryError, fallbackError);
        }
      },
    },
  };
}

async function repairStaleSequence(
  request: Request,
  response: Response,
  env: Env,
): Promise<Response> {
  if (response.status !== 409) return response;

  const responsePayload: unknown = await response.clone().json().catch(() => null);
  if (!isRecord(responsePayload) || responsePayload.error !== 'TURN_SEQUENCE_MISMATCH') {
    return response;
  }

  const access = responsePayload.access;
  if (!isRecord(access) || !Number.isSafeInteger(access.completedTurns)) return response;
  const completedTurns = access.completedTurns as number;
  if (completedTurns < 0) return response;

  const requestPayload: unknown = await request.json().catch(() => null);
  if (!isRecord(requestPayload)) return response;

  const expectedTurnNumber = completedTurns + 1;
  if (requestPayload.turnNumber === expectedTurnNumber) return response;

  console.info('Repairing stale AI chat turn sequence', {
    expectedTurnNumber,
  });

  const repairedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify({
      ...requestPayload,
      turnNumber: expectedTurnNumber,
    }),
  });

  return baseWorker.fetch(repairedRequest, env);
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const repairableRequest =
      url.pathname === AI_API_PATH && request.method === 'POST' ? request.clone() : null;
    const reliableEnv = withReliableAi(env);
    const response = await baseWorker.fetch(request, reliableEnv);

    if (!repairableRequest) return response;
    return repairStaleSequence(repairableRequest, response, reliableEnv);
  },

  async scheduled(controller: unknown, env: Env): Promise<void> {
    await baseWorker.scheduled(controller, env);
  },
};

export default worker;
