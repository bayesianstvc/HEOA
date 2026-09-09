import { Footer, Header } from '@/components/site-shell';
import { SiteSearch, type SearchEntry } from '@/components/site-search';
import { heoaMembers, records } from '@/lib/content';

export default function SearchPage() {
  const contentEntries: SearchEntry[] = records.filter((item) => !item.status || item.status === 'published').map((item) => ({
    id: item.id,
    title: item.title,
    description: item.excerpt,
    meta: `${item.sourceLabel} · ${item.date || '日期待核验'}`,
    href: `/content/${item.id}`,
    type: '内容',
  }));
  const memberEntries: SearchEntry[] = heoaMembers.map((member) => ({
    id: member.id,
    title: member.displayName,
    description: `${member.role}；${member.research}`,
    meta: member.organization,
    href: member.href,
    type: '成员',
  }));
  return <><Header/><main id="main-content" tabIndex={-1}><section className="page-hero search-hero"><p>SITE SEARCH</p><h1>全站搜索</h1><span>统一检索新闻、学术研究、团队成员与机构资料。</span></section><SiteSearch entries={[...contentEntries, ...memberEntries]}/></main><Footer/></>;
}
