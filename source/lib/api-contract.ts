import type {
  ContentRecord,
  ContentStatus,
  MemberRecord,
  MediaVariants,
} from '@/lib/content';

/**
 * V21 frontend/backend seam.
 *
 * The static repository and the future HTTP repository both implement these
 * shapes. Pages should depend on this contract rather than storage details.
 */
export const API_PATHS = {
  content: '/api/content',
  members: '/api/members',
  media: '/api/media',
} as const;

export const CONTENT_QUERY_KEYS = [
  'page', 'pageSize', 'q', 'year', 'category', 'centerId', 'status',
] as const;

export type ContentQueryKey = typeof CONTENT_QUERY_KEYS[number];
export type ApiStatus = ContentStatus;

export type ListQuery = {
  page: number;
  pageSize: number;
  q: string;
  year: string;
  category: string;
  centerId: string;
  status: ApiStatus | 'all';
};

export type ListMeta = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, string | number | boolean | null>;
};

export type ApiSuccess<T> = {
  data: T;
  meta?: ListMeta;
  error: null;
  requestId?: string;
};

export type ApiFailure = {
  data: null;
  error: ApiError;
  requestId?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ContentListResponse = (ApiSuccess<ContentRecord[]> & { meta: ListMeta }) | ApiFailure;
export type MemberListResponse = (ApiSuccess<MemberRecord[]> & { meta: ListMeta }) | ApiFailure;

export type MediaAssetResponse = ApiResponse<{
  assetId: string;
  variants: MediaVariants;
  metadata: {
    mimeType?: string;
    width?: number;
    height?: number;
    bytes?: number;
    alt?: string;
  };
  objectKey: string;
  url: string;
}>;

export type Idempotency = {
  idempotencyKey: string;
  expectedVersion?: number;
};

export type StatusTransition = {
  from: ApiStatus | null;
  to: ApiStatus;
  reason?: string;
  actorId?: string;
  occurredAt: string;
};

export type AuditRecord = {
  id: string;
  entityType: 'content' | 'member' | 'media';
  entityId: string;
  action: 'create' | 'update' | 'publish' | 'withdraw' | 'archive' | 'restore';
  transition?: StatusTransition;
  idempotencyKey?: string;
  actorId?: string;
  createdAt: string;
};

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;

const boundedInteger = (value: string | null, fallback: number, maximum = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(1, parsed));
};

/** Parse the one URL vocabulary used by news, research and member listings. */
export const parseListQuery = (search: string | URLSearchParams = ''): ListQuery => {
  const params = typeof search === 'string' ? new URLSearchParams(search.replace(/^\?/, '')) : search;
  const status = params.get('status') ?? 'all';
  const statuses: string[] = ['draft', 'review', 'published', 'withdrawn', 'archived', 'all'];
  return {
    page: boundedInteger(params.get('page'), 1),
    pageSize: boundedInteger(params.get('pageSize'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    q: params.get('q')?.trim() ?? '',
    year: params.get('year')?.trim() ?? '',
    category: params.get('category')?.trim() ?? '',
    centerId: params.get('centerId')?.trim() ?? '',
    status: statuses.includes(status) ? status as ListQuery['status'] : 'all',
  };
};

/** Keep unrelated hash fragments, but serialize only non-default filters. */
export const writeListQuery = (query: Partial<ListQuery>, current = '') => {
  const params = new URLSearchParams(current.replace(/^\?/, ''));
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  const values: Record<ContentQueryKey, string | undefined> = {
    page: page > 1 ? String(page) : undefined,
    pageSize: pageSize !== DEFAULT_PAGE_SIZE ? String(pageSize) : undefined,
    q: query.q?.trim() || undefined,
    year: query.year?.trim() || undefined,
    category: query.category?.trim() || undefined,
    centerId: query.centerId?.trim() || undefined,
    status: query.status && query.status !== 'all' ? query.status : undefined,
  };
  CONTENT_QUERY_KEYS.forEach((key) => {
    if (values[key]) params.set(key, values[key] as string);
    else params.delete(key);
  });
  return params.toString();
};

export type ContentApiClient = {
  list(query?: Partial<ListQuery>): Promise<ContentListResponse>;
  getById(id: string): Promise<ApiResponse<ContentRecord>>;
  create(input: Partial<ContentRecord> & Idempotency): Promise<ApiResponse<ContentRecord>>;
  update(id: string, input: Partial<ContentRecord> & Idempotency): Promise<ApiResponse<ContentRecord>>;
  transition(id: string, transition: StatusTransition & Idempotency): Promise<ApiResponse<ContentRecord>>;
};

export type MemberApiClient = {
  list(query?: Partial<ListQuery>): Promise<MemberListResponse>;
  getById(id: string): Promise<ApiResponse<MemberRecord>>;
  create(input: Partial<MemberRecord> & Idempotency): Promise<ApiResponse<MemberRecord>>;
  update(id: string, input: Partial<MemberRecord> & Idempotency): Promise<ApiResponse<MemberRecord>>;
  transition(id: string, transition: StatusTransition & Idempotency): Promise<ApiResponse<MemberRecord>>;
};

export type MediaApiClient = {
  resolve(assetId: string, variant?: 'original' | 'display' | 'thumbnail'): Promise<MediaAssetResponse>;
};
