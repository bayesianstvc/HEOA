import source from '@/content/site-content.json';
import { resolveMediaPath } from '@/lib/media-paths';
import memberProfilesSource from '@/content/member-profiles.json';
import memberDirectorySource from '@/content/member-directory.json';
import memberSnapshotSource from '@/content/member-snapshot-v23.json';

export type PublicationStatus = 'draft' | 'review' | 'published' | 'withdrawn' | 'archived';
export type ContentStatus = PublicationStatus;
export type MemberStatus = PublicationStatus;

export type ContentRecord = {
  id: string;
  source: 'heoa' | 'healthy-cities';
  sourceLabel: string;
  sourceId: number;
  kind: 'post' | 'page';
  section: 'news' | 'research' | 'page';
  slug: string;
  title: string;
  date: string;
  modified: string;
  excerpt: string;
  bodyHtml: string;
  featuredAssetId: string | null;
  category?: string;
  centerId?: string | null;
  legacyUrl: string;
  status?: ContentStatus;
};

export type MemberPlacement = 'home' | 'center' | 'team';
export type MediaVariants = {
  originalAssetId: string | null;
  displayAssetId: string | null;
  thumbnailAssetId: string | null;
};
export type MemberRecord = {
  id: string;
  contentId: string | null;
  displayName: string;
  source: 'heoa' | 'healthy-cities';
  assetId: string | null;
  media: MediaVariants;
  role: string;
  research: string;
  organization: string;
  email: string | null;
  bio: string;
  titleRank: number;
  isFeatured: boolean;
  centerId: string | null;
  status: MemberStatus;
  placements: MemberPlacement[];
  sortOrder: number;
  href: string;
  externalLinks?: Array<{ label: string; href: string }>;
};

type MemberDirectoryConfig = {
  schemaVersion: number;
  defaultStatus: MemberStatus;
  homeFeaturedIds: string[];
  centerFeaturedIds?: string[];
  centerMemberIds?: string[];
  records: Array<Partial<MemberRecord> & { id: string }>;
};

type SiteData = {
  counts: Record<string, number>;
  records: ContentRecord[];
  teams: { heoaLegacyPageId: string | null; healthyMemberIds: string[] };
  assets: Record<string, { assetId: string; source: string; file: string; path: string }>;
};

export const siteData = source as SiteData;
type MemberSnapshotRow = { name: string; details: string[]; href: string; imagePath: string; sourceImage?: string };
const memberSnapshot = memberSnapshotSource as MemberSnapshotRow[];
const restoredMemberPortraits: Record<string, string> = {
  '王秀丽': '/team-v23/heoa-member-v23-002-local-original.jpg',
  '张雨萌': '/team-v23/heoa-member-v23-028-local-original.png',
  '陈楚': '/team-v23/heoa-member-v23-031-local-original.jpg',
  '林小军': '/team-v23/heoa-member-v23-032-local-original.png',
  '周旭东': '/team-v23/heoa-member-v23-033-local-original.jpg',
  '赵莉': '/team-v23/heoa-member-v23-034-local-original.jpg',
  '潘杰': '/team-v23/heoa-member-v23-060-local-original.jpg',
};
const memberAssetPaths = Object.fromEntries(memberSnapshot.map((member, index) => [
  member.name === '宋超' ? 'heoa-v23:song-chao' : `heoa-v23:member-${String(index + 1).padStart(3, '0')}`,
  member.name === '宋超' ? '/team-v23/song-chao-v23.webp' : restoredMemberPortraits[member.name] ?? member.imagePath,
])) as Record<string, string>;
export const records = siteData.records;
// Keep logical asset IDs stable. Every environment resolves to the same
// byte-preserved original; historical profile aliases select verified originals.
const highResolutionAssetOverrides: Record<string, string> = {
  // The profile pages reference the compact healthy-cities exports. The
  // corresponding HEOA originals are kept locally and remain behind the
  // same logical assetId boundary for the UI.
  'healthy-cities:00440-%E9%99%88%E6%A5%9A-1-%E5%B7%B2%E5%8E%8B%E7%BC%A9.jpg': 'heoa:02815-%E9%99%88%E6%A5%9A-1-%E5%B7%B2%E5%8E%8B%E7%BC%A9-1.jpg',
  'healthy-cities:00441-%E9%82%B9%E9%94%9F.jpg': 'heoa:02848-%E9%82%B9%E9%94%9F.jpg',
  'healthy-cities:00442-%E6%9E%97%E5%B0%8F%E5%86%9B-%E5%B7%B2%E5%8E%8B%E7%BC%A9.jpg': 'heoa:02820-%E6%9E%97%E5%B0%8F%E5%86%9B-%E5%B7%B2%E5%8E%8B%E7%BC%A9-1.jpg',
  'healthy-cities:00437-%E7%8E%8B%E7%A7%80%E4%B8%BD-%E5%B7%B2%E5%8E%8B%E7%BC%A9.jpg': 'heoa:02836-%E7%8E%8B%E7%A7%80%E4%B8%BD-%E5%B7%B2%E5%8E%8B%E7%BC%A9-1.jpg',
  'healthy-cities:00443-%E5%BC%A0%E9%9B%A8%E8%90%8C-%E5%B7%B2%E5%8E%8B%E7%BC%A9.jpg': 'heoa:02842-%E5%BC%A0%E9%9B%A8%E8%90%8C-%E5%B7%B2%E5%8E%8B%E7%BC%A9-1.jpg',
  'healthy-cities:00436-%E5%AE%8B%E8%B6%85-%E5%B7%B2%E5%8E%8B%E7%BC%A9.jpg': 'heoa:02828-%E5%AE%8B%E8%B6%85-%E5%B7%B2%E5%8E%8B%E7%BC%A9-1.jpg',
  'healthy-cities:00444-%E8%B5%B5%E8%8E%89-%E5%B7%B2%E5%8E%8B%E7%BC%A9.png': 'heoa:02846-%E8%B5%B5%E8%8E%89.jpg',
  'healthy-cities:00445-%E5%88%98%E6%8C%AF%E8%B0%A7-%E5%B7%B2%E5%8E%8B%E7%BC%A9.jpg': 'heoa:02824-%E5%88%98%E6%8C%AF%E8%B0%A7-%E5%B7%B2%E5%8E%8B%E7%BC%A9-1.jpg',
  'healthy-cities:00350-%E6%BD%98%E6%9D%B0%E5%B7%B2%E5%8E%8B%E7%BC%A9.jpg': 'heoa:02827-%E6%BD%98%E6%9D%B0%E5%B7%B2%E5%8E%8B%E7%BC%A9-1.jpg',
};

const resolveAssetUrl = resolveMediaPath;
export const assetPath = (assetId?: string | null) => {
  const resolvedAssetId = assetId ? highResolutionAssetOverrides[assetId] ?? assetId : undefined;
  const originalPath = resolvedAssetId ? memberAssetPaths[resolvedAssetId] ?? siteData.assets[resolvedAssetId]?.path : undefined;
  const resolvedPath = originalPath ? resolveAssetUrl(originalPath) : undefined;
  return resolvedPath && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(resolvedPath) ? resolvedPath : undefined;
};
export type MediaVariant = 'original' | 'display' | 'thumbnail';
export const mediaAssetId = (media: MediaVariants | null | undefined, variant: MediaVariant = 'display') => {
  if (!media) return undefined;
  const selected = media[`${variant}AssetId`];
  return selected ?? media.displayAssetId ?? media.originalAssetId ?? media.thumbnailAssetId ?? undefined;
};
export const assetPathForMedia = (media: MediaVariants | null | undefined, variant: MediaVariant = 'display') => assetPath(mediaAssetId(media, variant));
export type ResolvedMedia = {
  assetId: string;
  variant: MediaVariant;
  path: string;
  source: string;
  file: string;
};
export const resolveMedia = (media: MediaVariants | null | undefined, variant: MediaVariant = 'display'): ResolvedMedia | undefined => {
  const selectedAssetId = mediaAssetId(media, variant);
  if (!selectedAssetId) return undefined;
  const resolvedAssetId = highResolutionAssetOverrides[selectedAssetId] ?? selectedAssetId;
  const asset = siteData.assets[resolvedAssetId];
  const path = assetPathForMedia(media, variant);
  return asset && path ? { assetId: selectedAssetId, variant, path, source: asset.source, file: asset.file } : undefined;
};
export const localizeBodyHtml = (html: string) => html.replace(
  /\/media\/(?:heoa|healthy-cities)\/[^"'()<>\s]+/g,
  resolveAssetUrl,
);
export type ContentQuery = {
  source?: ContentRecord['source'];
  kind?: ContentRecord['kind'];
  section?: ContentRecord['section'];
  status?: ContentStatus | ContentStatus[];
  search?: string;
  q?: string;
  year?: string;
  category?: string;
  centerId?: string | null;
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
};

const statusMatches = (status: ContentStatus | undefined, requested?: ContentQuery['status']) => {
  if (!requested) return !status || status === 'published';
  const statuses = new Set(Array.isArray(requested) ? requested : [requested]);
  return statuses.has(status ?? 'published');
};

/**
 * Content repository seam. The static export uses this same query shape that
 * the future API can implement, so pages never need to know storage details.
 */
export const listContent = (query: ContentQuery = {}) => {
  const search = (query.search ?? query.q)?.trim().toLocaleLowerCase();
  const filtered = records.filter((item) => {
    if (query.source && item.source !== query.source) return false;
    if (query.kind && item.kind !== query.kind) return false;
    if (query.section && item.section !== query.section) return false;
    if (query.year && !item.date.startsWith(query.year)) return false;
    if (query.category && query.category !== (item.category ?? item.section)) return false;
    if (query.centerId !== undefined && (item.centerId ?? null) !== query.centerId) return false;
    if (!statusMatches(item.status, query.status)) return false;
    if (search && !`${item.title} ${item.excerpt} ${item.sourceLabel}`.toLocaleLowerCase().includes(search)) return false;
    return true;
  });
  const pageSize = query.pageSize === undefined ? undefined : Math.min(100, Math.max(1, query.pageSize));
  const offset = Math.max(0, query.offset ?? (query.page && pageSize ? (Math.max(1, query.page) - 1) * pageSize : 0));
  const limit = query.limit ?? pageSize;
  return limit === undefined ? filtered.slice(offset) : filtered.slice(offset, offset + Math.max(0, limit));
};

export type ContentPage = {
  items: ContentRecord[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export const listContentPage = (query: ContentQuery = {}): ContentPage => {
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? query.limit ?? 12));
  const page = Math.max(1, query.page ?? Math.floor(Math.max(0, query.offset ?? 0) / pageSize) + 1);
  const all = listContent({ ...query, page: undefined, pageSize: undefined, offset: 0, limit: undefined });
  const pageCount = Math.max(1, Math.ceil(all.length / pageSize));
  const safePage = Math.min(page, pageCount);
  return {
    items: all.slice((safePage - 1) * pageSize, safePage * pageSize),
    total: all.length,
    page: safePage,
    pageSize,
    pageCount,
    hasNext: safePage < pageCount,
    hasPrevious: safePage > 1,
  };
};

export const getContent = (id: string) => records.find((item) => item.id === id && statusMatches(item.status));
export type ContentRepository = {
  list: (query?: ContentQuery) => ContentRecord[];
  listPage: (query?: ContentQuery) => ContentPage;
  getById: (id: string) => ContentRecord | undefined;
};
export const contentRepository: ContentRepository = { list: listContent, listPage: listContentPage, getById: getContent };
export const heoaNews = listContent({ source: 'heoa', kind: 'post', section: 'news' });
export const research = listContent({ kind: 'post', section: 'research' });
export const healthyNews = listContent({ source: 'healthy-cities', kind: 'post' });
export const healthyMembers = siteData.teams.healthyMemberIds.map(getContent).filter(Boolean) as ContentRecord[];
export const heoaMemberPage = siteData.teams.heoaLegacyPageId ? getContent(siteData.teams.heoaLegacyPageId) : undefined;

type MemberProfile = {
  role: string;
  research: string;
  organization: string;
  titleRank?: number;
  isFeatured?: boolean;
  centerId?: string | null;
  status?: MemberStatus;
};
const memberProfiles = memberProfilesSource as Record<string, MemberProfile>;
const memberDirectory = memberDirectorySource as MemberDirectoryConfig;
const configuredMembers = new Map(memberDirectory.records.map((member) => [member.id, member]));
export const getMemberProfile = (id: string) => memberProfiles[id];

const titleRankForRole = (role: string) => {
  if (/(^|[\s/、，,；;])(?:教授|研究员|主任医师|主任药师|主任护师|主任技师)(?=$|[\s/、，,；;])/.test(role)) return 0;
  if (/副教授|副研究员|副主任医师|副主任药师|副主任护师|副主任技师/.test(role)) return 2;
  return 3;
};

const completeMedia = (assetId: string | null, media?: Partial<MediaVariants> | null): MediaVariants => ({
  originalAssetId: media?.originalAssetId ?? assetId,
  displayAssetId: media?.displayAssetId ?? assetId,
  thumbnailAssetId: media?.thumbnailAssetId ?? assetId,
});

const cleanLegacyText = (value: string) => value
  .replace(/<br\s*\/?\s*>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#8211;|&ndash;/gi, '–')
  .replace(/&#8212;|&mdash;/gi, '—')
  .replace(/\s+/g, ' ')
  .trim();

const parseLegacyMembers = (html: string): MemberRecord[] => {
  const headings = Array.from(html.matchAll(/<h5\b[^>]*>([^<]+)<\/h5>/gi));
  return headings.map((heading, index) => {
    const headingIndex = heading.index ?? 0;
    const previous = html.slice(0, headingIndex);
    const imageStart = previous.lastIndexOf('<img');
    const imageEnd = imageStart >= 0 ? previous.indexOf('>', imageStart) : -1;
    const imageTag = imageStart >= 0 ? previous.slice(imageStart, imageEnd >= 0 ? imageEnd + 1 : undefined) : '';
    const sourcePath = /\bsrc=["'](\/media\/heoa\/[^"']+)["']/i.exec(imageTag)?.[1] ?? '';
    const attachmentId = /data-attachment-id=["'](\d+)["']/i.exec(imageTag)?.[1];
    const assetId = siteData.assets[Object.keys(siteData.assets).find((id) => siteData.assets[id]?.path === sourcePath) ?? '']?.assetId
      ?? (sourcePath ? `heoa:${sourcePath.split('/').pop()}` : null);
    const nextIndex = headings[index + 1]?.index ?? html.length;
    const segment = html.slice(headingIndex, nextIndex);
    const paragraphs = Array.from(segment.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
      .map((match) => cleanLegacyText(match[1] ?? ''))
      .filter(Boolean);
    const research = paragraphs.find((paragraph) => /^研究方向\s*[:：]/.test(paragraph))?.replace(/^研究方向\s*[:：]\s*/, '') ?? '研究方向待补充';
    const role = paragraphs.find((paragraph) => !/^研究方向\s*[:：]/.test(paragraph)) ?? '团队成员';
    const organization = paragraphs.find((paragraph) => /大学|学院|医院|中心|公司/.test(paragraph) && !/^研究方向\s*[:：]/.test(paragraph)) ?? 'HEOA 协作网络';
    const email = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.exec(segment)?.[0] ?? null;
    const id = `heoa-member-${attachmentId ?? index + 1}`;
    const configured = configuredMembers.get(id);
    const displayName = configured?.displayName ?? cleanLegacyText(heading[1] ?? '未命名成员');
    return {
      id,
      contentId: configured?.contentId ?? heoaMemberPage?.id ?? null,
      displayName,
      source: configured?.source ?? 'heoa',
      assetId: configured?.assetId ?? assetId,
      media: completeMedia(configured?.assetId ?? assetId, configured?.media),
      role: configured?.role ?? role,
      research: configured?.research ?? research,
      organization: configured?.organization ?? organization,
      email: configured?.email ?? email,
      bio: configured?.bio ?? paragraphs.join(' '),
      titleRank: configured?.titleRank ?? titleRankForRole(role),
      isFeatured: configured?.isFeatured ?? false,
      centerId: configured?.centerId ?? null,
      status: configured?.status ?? memberDirectory.defaultStatus ?? 'published',
      placements: configured?.placements ?? ['team'],
      sortOrder: configured?.sortOrder ?? index,
      href: configured?.href ?? `/team#member-${id}`,
    };
  });
};

const toContentMember = (member: ContentRecord, index: number): MemberRecord => {
  const profile = memberProfiles[member.id];
  const configured = configuredMembers.get(member.id);
  const role = configured?.role ?? profile?.role ?? '团队成员';
  const assetId = configured?.assetId ?? member.featuredAssetId;
  return {
    id: member.id,
    contentId: configured?.contentId ?? member.id,
    displayName: configured?.displayName ?? member.title,
    source: configured?.source ?? member.source,
    assetId,
    media: completeMedia(assetId, configured?.media),
    role,
    research: configured?.research ?? profile?.research ?? '研究方向待补充',
    organization: configured?.organization ?? profile?.organization ?? member.sourceLabel,
    email: configured?.email ?? null,
    bio: configured?.bio ?? member.excerpt,
    titleRank: configured?.titleRank ?? profile?.titleRank ?? titleRankForRole(role),
    isFeatured: configured?.isFeatured ?? profile?.isFeatured ?? false,
    centerId: configured?.centerId ?? profile?.centerId ?? (member.source === 'healthy-cities' ? 'healthy-cities' : null),
    status: configured?.status ?? profile?.status ?? memberDirectory.defaultStatus ?? 'published',
    placements: configured?.placements ?? (member.source === 'healthy-cities' ? ['center', 'team'] : ['team']),
    sortOrder: configured?.sortOrder ?? index,
    href: configured?.href ?? `/content/${member.id}`,
  };
};

const legacyMembers = parseLegacyMembers(heoaMemberPage?.bodyHtml ?? '');
const normalizeMemberName = (value: string) => value.replace(/\s+/g, '');
const legacyMembersByName = new Map(legacyMembers.map((member) => [normalizeMemberName(member.displayName), member]));
const configuredMembersByName = new Map(memberDirectory.records
  .filter((member) => member.displayName)
  .map((member) => [normalizeMemberName(member.displayName ?? ''), member]));
const centerMemberIds = new Set(memberDirectory.centerMemberIds ?? []);

export const heoaMembers: MemberRecord[] = memberSnapshot.map((snapshot, index) => {
  const name = normalizeMemberName(snapshot.name);
  const legacy = legacyMembersByName.get(name);
  const configured = configuredMembersByName.get(name);
  const id = configured?.id ?? legacy?.id ?? `heoa-member-v23-${String(index + 1).padStart(3, '0')}`;
  const assetId = name === '宋超' ? 'heoa-v23:song-chao' : `heoa-v23:member-${String(index + 1).padStart(3, '0')}`;
  const organization = snapshot.details[0] ?? configured?.organization ?? legacy?.organization ?? 'HEOA 协作网络';
  const role = name === '宋超' ? '副研究员/博士生导师' : snapshot.details[1] ?? configured?.role ?? legacy?.role ?? '团队成员';
  const primaryHref = name === '宋超' ? 'https://chaosong.blog/' : snapshot.href || configured?.href || legacy?.href || `/team#member-${id}`;
  const externalLinks = name === '宋超'
    ? [
      { label: '个人主页', href: 'https://chaosong.blog/' },
      { label: 'BSTVC 官网', href: 'https://bayesianstvc.github.io/' },
    ]
    : [...new Set([snapshot.href, configured?.href, legacy?.href].filter((href): href is string => Boolean(href && /^https?:\/\//.test(href))))]
      .map((href, linkIndex) => ({ label: linkIndex === 0 ? '个人主页' : '更多个人资料', href }));
  const isCenterMember = centerMemberIds.has(id);
  return {
    id,
    contentId: configured?.contentId ?? legacy?.contentId ?? heoaMemberPage?.id ?? null,
    displayName: name,
    source: 'heoa',
    assetId,
    media: completeMedia(assetId),
    role,
    research: configured?.research ?? legacy?.research ?? '研究方向待补充',
    organization,
    email: configured?.email ?? legacy?.email ?? null,
    bio: configured?.bio ?? legacy?.bio ?? `${organization}，${role}`,
    titleRank: titleRankForRole(role),
    isFeatured: ['潘杰', '周旭东', '杨练', '张伶俐', '赵莉'].includes(name),
    centerId: isCenterMember ? 'healthy-cities' : null,
    status: 'published',
    placements: isCenterMember ? ['team', 'center'] : ['team'],
    sortOrder: index,
    href: primaryHref,
    externalLinks,
  };
});
export const healthyMemberRecords = healthyMembers.map(toContentMember);
const centerDirectoryPage = getContent('healthy-cities-page-119');
const centerOnlyContentMembers = healthyMemberRecords
  .filter((member) => centerMemberIds.has(member.id))
  .map((member): MemberRecord => ({ ...member, placements: ['center'] }));
const centerOnlyConfiguredMembers = centerDirectoryPage ? memberDirectory.records
  .filter((member) => centerMemberIds.has(member.id) && member.contentId === centerDirectoryPage.id)
  .map((member, index) => toContentMember({
    ...centerDirectoryPage,
    id: member.id,
    title: member.displayName ?? centerDirectoryPage.title,
    featuredAssetId: member.assetId ?? null,
  }, index)) : [];
const allMembers = [...heoaMembers, ...centerOnlyContentMembers, ...centerOnlyConfiguredMembers];
const membersById = new Map(allMembers.map((member) => [member.id, member]));
export const centerMembers = [...centerMemberIds]
  .map((id) => membersById.get(id))
  .filter((member): member is MemberRecord => Boolean(member && member.status === 'published'));

export type MemberQuery = {
  source?: MemberRecord['source'];
  centerId?: string | null;
  status?: MemberStatus | MemberStatus[];
  isFeatured?: boolean;
  placement?: MemberPlacement;
  search?: string;
  q?: string;
  year?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'titleRank' | 'sortOrder';
  offset?: number;
  limit?: number;
};

export const getMemberById = (id: string) => membersById.get(id);
export const listMembers = (query: MemberQuery = {}) => {
  const statuses = query.status ? new Set(Array.isArray(query.status) ? query.status : [query.status]) : undefined;
  const search = (query.search ?? query.q)?.trim().toLocaleLowerCase();
  const filtered = allMembers.filter((member) => {
    if (query.source && member.source !== query.source) return false;
    if (query.centerId !== undefined && member.centerId !== query.centerId) return false;
    if (statuses && !statuses.has(member.status)) return false;
    if (query.isFeatured !== undefined && member.isFeatured !== query.isFeatured) return false;
    if (query.placement && !member.placements.includes(query.placement)) return false;
    if (search && !`${member.displayName} ${member.role} ${member.research} ${member.organization}`.toLocaleLowerCase().includes(search)) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => query.sortBy === 'titleRank'
    ? a.titleRank - b.titleRank || a.sortOrder - b.sortOrder
    : a.sortOrder - b.sortOrder);
  const pageSize = query.pageSize === undefined ? undefined : Math.min(100, Math.max(1, query.pageSize));
  const offset = Math.max(0, query.offset ?? (query.page && pageSize ? (Math.max(1, query.page) - 1) * pageSize : 0));
  const limit = query.limit ?? pageSize;
  return limit === undefined ? sorted.slice(offset) : sorted.slice(offset, offset + Math.max(0, limit));
};

export type MemberPage = {
  items: MemberRecord[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export const listMembersPage = (query: MemberQuery = {}): MemberPage => {
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? query.limit ?? 12));
  const page = Math.max(1, query.page ?? Math.floor(Math.max(0, query.offset ?? 0) / pageSize) + 1);
  const all = listMembers({ ...query, page: undefined, pageSize: undefined, offset: 0, limit: undefined });
  const pageCount = Math.max(1, Math.ceil(all.length / pageSize));
  const safePage = Math.min(page, pageCount);
  return {
    items: all.slice((safePage - 1) * pageSize, safePage * pageSize),
    total: all.length,
    page: safePage,
    pageSize,
    pageCount,
    hasNext: safePage < pageCount,
    hasPrevious: safePage > 1,
  };
};

export type MemberRepository = {
  list: (query?: MemberQuery) => MemberRecord[];
  listPage: (query?: MemberQuery) => MemberPage;
  getById: (id: string) => MemberRecord | undefined;
};

export const memberRepository: MemberRepository = { list: listMembers, listPage: listMembersPage, getById: getMemberById };

export const prioritizeMembers = (members: MemberRecord[]) => [...members]
  .sort((a, b) => a.titleRank - b.titleRank || a.sortOrder - b.sortOrder);

const memberByName = (name: string) => heoaMembers.find((member) => member.displayName === name && member.status === 'published');
export const homeFeaturedMembers = ['潘杰', '周旭东', '杨练', '张伶俐', '赵莉']
  .map(memberByName)
  .filter((member): member is MemberRecord => Boolean(member));
export const centerFeaturedMembers = ['潘杰', '王秀丽', '张雨萌', '林小军', '宋超']
  .map(memberByName)
  .filter((member): member is MemberRecord => Boolean(member));
// Compatibility export for existing center-page consumers.
export const featuredMembers = centerFeaturedMembers;

const disclosureSlugs = new Set(['resources-download', 'organization-chart', 'recruitment', 'wechat', 'team-info']);
export const disclosures = records.filter((item) => statusMatches(item.status) && item.source === 'heoa' && item.kind === 'page' && disclosureSlugs.has(item.slug));
export const healthyDisclosures = records.filter((item) => statusMatches(item.status) && item.source === 'healthy-cities' && item.kind === 'page' && ['info2', 'contact-us'].includes(item.slug));

export const formatDate = (date: string) => date ? date.replaceAll('-', '.') : '日期待核验';

const htmlEntities: Record<string, string> = {
  amp: '&', apos: "'", gt: '>', hellip: '…', laquo: '《', ldquo: '“',
  lt: '<', middot: '·', nbsp: ' ', ndash: '–', quot: '"', raquo: '》',
  rdquo: '”', rsquo: '’', lsquo: '‘', mdash: '—', times: '×',
};

export const plainTextExcerpt = (value: string) => value
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#')) {
      const hex = code[1]?.toLowerCase() === 'x';
      const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }
    return htmlEntities[code.toLowerCase()] ?? entity;
  })
  .replace(/\[(?:&?hellip;?|\.{3})\]/gi, '…')
  .replace(/\s+/g, ' ')
  .trim();

const stableIdFromString = (prefix: string, value: string) => {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `${prefix}-${(hash >>> 0).toString(36)}`;
};

export type AttachmentRef = { id: string; href: string; label: string };
export const extractAttachments = (html: string) => {
  const localized = localizeBodyHtml(html);
  const links = Array.from(localized.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));
  const seen = new Set<string>();
  return links.flatMap((match) => {
    const href = match[1];
    if (!/\.(?:pdf|docx?|xlsx?|pptx?|zip)(?:[?#].*)?$/i.test(href) || seen.has(href)) return [];
    seen.add(href);
    const label = match[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    return [{ id: stableIdFromString('attachment', href.replace(/[?#].*$/, '')), href, label: label || href.split('/').pop() || '下载附件' }];
  });
};
