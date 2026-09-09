'use client';

import Link from './plain-link';
import { ArrowLeft, ArrowRight, CalendarDays, RotateCcw, Search } from 'lucide-react';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { MediaImage } from '@/components/media-image';
import { parseListQuery, writeListQuery, type ListQuery } from '@/lib/api-contract';

export type ArchiveViewItem = {
  id: string;
  title: string;
  excerpt: string;
  sourceLabel: string;
  category: string;
  date: string;
  displayDate: string;
  image?: string;
  assetId?: string | null;
  status?: string;
  centerId?: string | null;
};

const PAGE_SIZE_OPTIONS = [9, 12, 18];
const categoryLabel = (category: string) => category === 'research' ? '学术研究' : category === 'news' ? '新闻资讯' : category;

export function ArchiveList({ items }: { items: ArchiveViewItem[] }) {
  const years = useMemo(() => Array.from(new Set(items.map((item) => item.date.slice(0, 4)).filter(Boolean))).sort((a, b) => b.localeCompare(a)), [items]);
  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(), [items]);
  const [query, setQuery] = useState<ListQuery>(() => parseListQuery(''));
  const [filtersReady, setFiltersReady] = useState(false);

  useEffect(() => {
    const syncFromLocation = () => {
      startTransition(() => {
        setQuery(parseListQuery(window.location.search));
        setFiltersReady(true);
      });
    };
    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  useEffect(() => {
    if (!filtersReady) return;
    const search = writeListQuery(query, window.location.search);
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) window.history.replaceState(null, '', nextUrl);
  }, [filtersReady, query]);

  const updateQuery = (patch: Partial<ListQuery>, resetPage = true) => {
    startTransition(() => setQuery((current) => ({ ...current, ...patch, page: resetPage ? 1 : patch.page ?? current.page })));
  };
  const clearFilters = () => updateQuery({ q: '', year: '', category: '', centerId: '', status: 'all', pageSize: 12 });

  const visibleItems = useMemo(() => {
    const normalizedKeyword = query.q.trim().toLocaleLowerCase();
    return items.filter((item) => {
      if (query.year && !item.date.startsWith(query.year)) return false;
      if (query.category && item.category !== query.category) return false;
      if (query.centerId && item.centerId !== query.centerId) return false;
      if (query.status !== 'all' && item.status && item.status !== query.status) return false;
      return !normalizedKeyword || `${item.title} ${item.excerpt} ${item.sourceLabel}`.toLocaleLowerCase().includes(normalizedKeyword);
    });
  }, [items, query.category, query.centerId, query.q, query.status, query.year]);

  const pageCount = Math.max(1, Math.ceil(visibleItems.length / query.pageSize));
  const currentPage = Math.min(query.page, pageCount);
  useEffect(() => {
    if (filtersReady && query.page !== currentPage) updateQuery({ page: currentPage }, false);
  }, [currentPage, filtersReady, query.page]);
  const pageItems = visibleItems.slice((currentPage - 1) * query.pageSize, currentPage * query.pageSize);
  const pageNumbers = Array.from({ length: Math.min(5, pageCount) }, (_, index) => {
    const start = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
    return start + index;
  });

  return <>
    <div className="archive-toolbar" aria-label="资料筛选与分页">
      <div className="archive-total" aria-live="polite"><strong>{visibleItems.length}</strong><span>项筛选结果</span><small>资料库共 {items.length} 项 · 第 {currentPage} / {pageCount} 页</small></div>
      <fieldset className="archive-filters"><legend className="sr-only">资料筛选</legend>
        <label><span>栏目</span><select value={query.category || 'all'} onChange={(event) => updateQuery({ category: event.target.value === 'all' ? '' : event.target.value })}>
          <option value="all">全部栏目</option>
          {categories.map((item) => <option value={item} key={item}>{categoryLabel(item)}</option>)}
        </select></label>
        <label><span>年份</span><select value={query.year || 'all'} onChange={(event) => updateQuery({ year: event.target.value === 'all' ? '' : event.target.value })}>
          <option value="all">全部年份</option>
          {years.map((item) => <option value={item} key={item}>{item} 年</option>)}
        </select></label>
        <label className="archive-search"><span>关键词</span><Search aria-hidden="true"/><input type="search" value={query.q} onChange={(event) => updateQuery({ q: event.target.value })} placeholder="搜索标题与摘要" /></label>
        <label><span>每页</span><select value={query.pageSize} onChange={(event) => updateQuery({ pageSize: Number(event.target.value) })}>
          {PAGE_SIZE_OPTIONS.map((size) => <option value={size} key={size}>{size} 条</option>)}
        </select></label>
        <button className="archive-clear" type="button" onClick={clearFilters}><RotateCcw aria-hidden="true"/>清除筛选</button>
      </fieldset>
    </div>
    <div className="archive-list" data-page={currentPage} data-page-size={query.pageSize} data-query={JSON.stringify(query)}>
      {pageItems.map((item) => <article className={`archive-card${item.image ? ' has-image' : ' no-image'}`} key={item.id} data-content-id={item.id} data-status={item.status ?? 'published'} data-reveal="card">
        {item.image && <Link className="archive-card-image" href={`/content/${item.id}`}><MediaImage src={item.image} assetId={item.assetId} alt={item.title} loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 50vw" fallbackLabel="图片暂不可用"/></Link>}
        <div className="card-copy"><p className="meta"><span>{item.sourceLabel}</span><time><CalendarDays/>{item.displayDate}</time></p><h3><Link href={`/content/${item.id}`}>{item.title}</Link></h3><p>{item.excerpt || '阅读全文查看完整资料。'}</p><Link className="read" href={`/content/${item.id}`}>阅读全文 <ArrowRight /></Link></div>
      </article>)}
      {visibleItems.length === 0 && <div className="archive-empty"><strong>暂未找到匹配资料</strong><span>请尝试调整关键词、年份或栏目。</span><button type="button" onClick={clearFilters}>重置筛选</button></div>}
    </div>
    {pageCount > 1 && <nav className="archive-pagination" aria-label="资料分页">
      <button type="button" onClick={() => updateQuery({ page: Math.max(1, currentPage - 1) }, false)} disabled={currentPage === 1} aria-label="上一页"><ArrowLeft aria-hidden="true"/>上一页</button>
      <div className="archive-page-numbers">{pageNumbers.map((pageNumber) => <button type="button" className={pageNumber === currentPage ? 'is-current' : ''} aria-current={pageNumber === currentPage ? 'page' : undefined} onClick={() => updateQuery({ page: pageNumber }, false)} key={pageNumber}>{pageNumber}</button>)}</div>
      <button type="button" onClick={() => updateQuery({ page: Math.min(pageCount, currentPage + 1) }, false)} disabled={currentPage === pageCount} aria-label="下一页">下一页<ArrowRight aria-hidden="true"/></button>
    </nav>}
  </>;
}
