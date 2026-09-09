import Link from '../components/plain-link';
import { ArrowRight, Building2 } from 'lucide-react';
import { ContentCard } from '@/components/content-views';
import { HeroCarousel } from '@/components/hero-carousel';
import { MemberCard } from '@/components/member-card';
import { Footer, Header, MoreLink } from '@/components/site-shell';
import { assetPath, formatDate, getContent, homeFeaturedMembers, listContent } from '@/lib/content';

export default function Home() {
  const latestNews = listContent({ source: 'heoa', kind: 'post', section: 'news', limit: 6 });
  const latestResearch = listContent({ kind: 'post', section: 'research', limit: 6 });
  const coreMembers = homeFeaturedMembers;
  const heroSlides = ['heoa-post-10946', 'heoa-post-10890', 'heoa-post-10937'].flatMap((id) => {
    const item = getContent(id);
    const image = assetPath(item?.featuredAssetId);
    return item && image ? [{ href: `/content/${item.id}`, image, title: item.title, date: formatDate(item.date) }] : [];
  });
  return <><Header/><main id="main-content" tabIndex={-1}>
    <section className="home-hero"><div className="hero-copy"><p className="kicker">HEALTHCARE · EVIDENCE · ORGANIZATION</p><h1>以专业研究服务<br/><em>健康中国建设</em></h1><p>HEOA 健康服务与产业组织研究团队，汇聚公共卫生、医学、经济学、管理学与地理科学力量，以真实证据支持健康服务优化、产业发展与公共治理。</p><div className="hero-actions"><Link className="button red" href="/team">了解 HEOA <ArrowRight/></Link><Link className="button line" href="/research">浏览学术研究</Link></div></div><HeroCarousel slides={heroSlides}/></section>
    <section className="home-section" data-reveal="section"><div className="section-head"><div><p className="section-kicker">NEWS &amp; UPDATES</p><h2>新闻资讯</h2></div><MoreLink href="/news">查看全部</MoreLink></div><div className="three-grid home-news-grid">{latestNews.map(item=><ContentCard item={item} key={item.id}/>)}</div></section>
    <section className="home-section research-band" data-reveal="section"><div className="section-head"><div><p className="section-kicker">ACADEMIC RESEARCH</p><h2>学术研究</h2></div><MoreLink href="/research">进入科学博客</MoreLink></div><div className="three-grid">{latestResearch.map(item=><ContentCard item={item} key={item.id}/>)}</div></section>
    <section className="home-section members-section" data-reveal="section"><div className="section-head"><div><p className="section-kicker">OUR PEOPLE</p><h2>核心成员</h2><p className="section-note">汇聚跨学科研究力量，连接健康研究与实践。</p></div><MoreLink href="/team">查看 HEOA 全部成员</MoreLink></div><div className="member-grid">{coreMembers.map(member=><MemberCard member={member} compact showcase key={member.id}/>)}</div></section>
    <section className="thinktank-callout"><div><p className="section-kicker">HEOA THINK TANK</p><h2>健康城市发展研究中心</h2><p>作为 HEOA 智库的重要组成，中心聚焦城市健康治理、健康环境、健康服务与健康产业，形成相对独立、又与主站学术研究共享的机构官网。</p><Link className="button light" href="/think-tank/healthy-cities">进入中心网站 <ArrowRight/></Link></div><div className="center-mark"><img src="/media-web-v24/brand/healthy-cities-logo-web-v24.webp" alt="健康城市发展研究中心"/><Building2/></div></section>
    <section className="initiative-grid" aria-label="HEOA 专题研究平台">
      <a className="initiative-card chronic" href="https://scu-heoa-chronic.pages.dev/" target="_blank" rel="noopener noreferrer"><div className="initiative-symbol heoa-circle" aria-label="HEOA 标志">HEOA</div><div className="initiative-copy"><p>HEOA RESEARCH PROGRAM</p><h2>整合式智慧慢病管理模式研究</h2><span>围绕重大慢病防治技术推广机制，系统展示研究动态、成果、技术路线、合作单位与项目团队。</span><strong>访问专题网站 <ArrowRight/></strong></div></a>
      <a className="initiative-card bstvc" href="https://bayesianstvc.github.io/" target="_blank" rel="noopener noreferrer"><div className="initiative-symbol bstvc-logo"><img src="/media-web-v24/brand/bstvc-official-web-v24.webp" alt="BSTVC 官方标志" loading="lazy"/></div><div className="initiative-copy"><p>SPATIOTEMPORAL EXPLAINABILITY</p><h2>时空可解释研究组织 BSTVC</h2><span>聚焦贝叶斯时空变系数模型、空间统计、可解释 GeoAI，以及从方法研究到开放工具的转化。</span><strong>访问 BSTVC 官网 <ArrowRight/></strong></div></a>
    </section>
  </main><Footer/></>;
}
