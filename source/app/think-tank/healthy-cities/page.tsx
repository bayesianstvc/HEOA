import Link from '../../../components/plain-link';
import { ArrowRight, Building2, Leaf } from 'lucide-react';
import { ContentCard } from '@/components/content-views';
import { MemberCard } from '@/components/member-card';
import { CenterFooter, CenterHeader, MoreLink } from '@/components/site-shell';
import { centerFeaturedMembers, listContent } from '@/lib/content';

export default function HealthyCitiesHome() {
  const news = listContent({ source: 'healthy-cities', kind: 'post', limit: 6 });
  const latestResearch = listContent({ kind: 'post', section: 'research', limit: 6 });
  return <><CenterHeader/><main id="main-content" tabIndex={-1} className="center-site">
    <section className="center-hero"><div><p>INSTITUTE FOR HEALTHY CITIES</p><h1>以研究与协同创新<br/>推动健康城市建设</h1><span>聚焦城市健康治理、健康环境、健康服务与健康产业，为城市健康发展提供科学研究与政策建议。</span><div><Link className="button teal" href="/think-tank/healthy-cities/team">中心成员 <ArrowRight/></Link><Link className="button clear" href="/think-tank/healthy-cities/news">新闻资讯</Link></div></div><div className="city-visual"><div className="city-logo"><img src="/media-web-v24/brand/healthy-cities-logo-web-v24.webp" alt="健康城市发展研究中心"/></div><Building2/><Leaf/></div></section>
    <section className="center-section" data-reveal="section"><div className="section-head"><div><p className="center-kicker">CENTER UPDATES</p><h2>新闻资讯</h2></div><MoreLink href="/think-tank/healthy-cities/news">查看全部</MoreLink></div><div className="three-grid center-news-grid">{news.map(item=><ContentCard item={item} key={item.id}/>)}</div></section>
    <section className="center-shared-research" data-reveal="section"><div className="section-head"><div><p className="center-kicker">SHARED SCIENCE BLOG</p><h2>近期研究</h2><p>HEOA 主站统一维护研究成果，中心同步呈现最新研究。</p></div><MoreLink href="/research">进入学术研究</MoreLink></div><div className="three-grid center-research-grid">{latestResearch.map(item=><ContentCard item={item} key={item.id}/>)}</div></section>
    <section className="center-section center-people-section" data-reveal="section"><div className="section-head"><div><p className="center-kicker">OUR PEOPLE</p><h2>核心成员</h2><p className="section-note">汇聚健康城市领域的跨学科研究力量。</p></div><MoreLink href="/think-tank/healthy-cities/team">查看中心成员</MoreLink></div><div className="member-grid">{centerFeaturedMembers.map(member=><MemberCard member={member} compact key={member.id}/>)}</div></section>
  </main><CenterFooter/></>;
}
