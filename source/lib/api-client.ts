import type { ContentRecord, MemberRecord } from '@/lib/content';
import {
  API_PATHS,
  type ApiResponse,
  type ContentListResponse,
  type ContentApiClient,
  type Idempotency,
  type ListQuery,
  type MediaApiClient,
  type MediaAssetResponse,
  type MemberListResponse,
  type MemberApiClient,
  type StatusTransition,
  parseListQuery,
  writeListQuery,
} from '@/lib/api-contract';

type RequestOptions = RequestInit & { idempotency?: Idempotency };

const requestJson = async <T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  try {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (options.idempotency?.idempotencyKey) headers.set('Idempotency-Key', options.idempotency.idempotencyKey);
    if (options.idempotency?.expectedVersion !== undefined) headers.set('If-Match-Version', String(options.idempotency.expectedVersion));
    const response = await fetch(url, { ...options, headers });
    const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
    if (payload && 'error' in payload && payload.error) return payload;
    if (!response.ok) return { data: null, error: { code: `HTTP_${response.status}`, message: `请求失败（${response.status}）` } };
    return payload ?? { data: null, error: { code: 'INVALID_RESPONSE', message: '服务返回了无法识别的响应。' } };
  } catch (error) {
    return { data: null, error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : '网络请求失败。' } };
  }
};

const queryString = (query: Partial<ListQuery> = {}) => writeListQuery({ ...parseListQuery(''), ...query });
const body = (input: unknown) => JSON.stringify(input);

export const httpContentApi: ContentApiClient = {
  list: (query = {}) => requestJson<ContentRecord[]>(`${API_PATHS.content}?${queryString(query)}`) as Promise<ContentListResponse>,
  getById: (id) => requestJson<ContentRecord>(`${API_PATHS.content}/${encodeURIComponent(id)}`),
  create: (input) => requestJson<ContentRecord>(API_PATHS.content, { method: 'POST', body: body(input), idempotency: input }),
  update: (id, input) => requestJson<ContentRecord>(`${API_PATHS.content}/${encodeURIComponent(id)}`, { method: 'PATCH', body: body(input), idempotency: input }),
  transition: (id, input) => requestJson<ContentRecord>(`${API_PATHS.content}/${encodeURIComponent(id)}/transitions`, { method: 'POST', body: body(input), idempotency: input }),
};

export const httpMemberApi: MemberApiClient = {
  list: (query = {}) => requestJson<MemberRecord[]>(`${API_PATHS.members}?${queryString(query)}`) as Promise<MemberListResponse>,
  getById: (id) => requestJson<MemberRecord>(`${API_PATHS.members}/${encodeURIComponent(id)}`),
  create: (input) => requestJson<MemberRecord>(API_PATHS.members, { method: 'POST', body: body(input), idempotency: input }),
  update: (id, input) => requestJson<MemberRecord>(`${API_PATHS.members}/${encodeURIComponent(id)}`, { method: 'PATCH', body: body(input), idempotency: input }),
  transition: (id, input) => requestJson<MemberRecord>(`${API_PATHS.members}/${encodeURIComponent(id)}/transitions`, { method: 'POST', body: body(input), idempotency: input }),
};

export const httpMediaApi: MediaApiClient = {
  resolve: (assetId, variant = 'display') => requestJson(`${API_PATHS.media}/${encodeURIComponent(assetId)}?variant=${variant}`) as Promise<MediaAssetResponse>,
};

export const transitionPayload = (from: StatusTransition['from'], to: StatusTransition['to'], idempotencyKey: string, reason?: string): StatusTransition & Idempotency => ({
  from,
  to,
  reason,
  occurredAt: new Date().toISOString(),
  idempotencyKey,
});
