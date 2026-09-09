'use client';

import { useMemo, useState } from 'react';
import Link from '@/components/plain-link';
import { ArrowRight, Search } from 'lucide-react';

export type SearchEntry = { id: string; title: string; description: string; meta: string; href: string; type: '内容' | '成员' };

export function SiteSearch({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    if (!keyword) return entries.slice(0, 12);
    return entries.filter((entry) => `${entry.title} ${entry.description} ${entry.meta}`.toLocaleLowerCase().includes(keyword)).slice(0, 60);
  }, [entries, query]);
  return <section className="site-search-panel">
    <label className="site-search-input"><Search aria-hidden="true"/><span className="sr-only">搜索全站</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索新闻、研究、成员或机构"/></label>
    <p className="site-search-count" aria-live="polite">{query ? `找到 ${results.length} 条结果` : '输入关键词，或浏览最近内容与成员'}</p>
    <div className="site-search-results">{results.map((entry) => <Link key={`${entry.type}-${entry.id}`} href={entry.href} className="site-search-result" {...(/^https?:\/\//.test(entry.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><span>{entry.type}</span><div><h2>{entry.title}</h2><p>{entry.description}</p><small>{entry.meta}</small></div><ArrowRight aria-hidden="true"/></Link>)}</div>
    {query && results.length === 0 ? <div className="site-search-empty">暂未找到匹配内容，请尝试姓名、研究主题或机构简称。</div> : null}
  </section>;
}
