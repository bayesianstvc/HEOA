import Link from './plain-link';
import { ArrowRight, Mail, MapPin, Menu, Phone, Search } from 'lucide-react';
import { RevealObserver } from '@/components/reveal-observer';
import { LanguageMenu } from '@/components/language-menu';
import { InstituteMenu } from '@/components/institute-menu';

const mainNav = [
  ['/', '首页'], ['/news', '新闻资讯'], ['/research', '学术研究'], ['/team', '团队成员'], ['/disclosure', '信息公开'],
];
const instituteNav = [
  ['/think-tank/healthy-cities', '健康城市发展研究中心'],
  ['https://scu-heoa-chronic.pages.dev/', '智慧慢病管理'],
  ['https://bayesianstvc.github.io/', 'BSTVC 时空可解释研究'],
];
const centerNav = [
  ['/think-tank/healthy-cities', '中心首页'], ['/think-tank/healthy-cities/news', '新闻资讯'], ['/research', '科学研究 ↗'], ['/think-tank/healthy-cities/team', '中心成员'], ['/think-tank/healthy-cities/disclosure', '信息公开'], ['/', 'HEOA智库'],
];

function MobileMenu({items,children}:{items:string[][];children?:React.ReactNode}) {
  return <details className="mobile-menu"><summary aria-label="打开导航菜单"><Menu/><span>菜单</span></summary><div>{items.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}{children}</div></details>;
}

export function Header() {
  return <><RevealObserver/><a className="skip-link" href="#main-content">跳到主要内容</a><div className="utility"><span>HEOA 智库</span><span>Healthcare Evaluation and Organizational Analysis</span></div><header className="header">
    <Link href="/" className="logo"><img src="/media-web-v24/brand/heoa-logo-web-v24.webp" alt="HEOA 健康服务与产业组织研究"/></Link>
    <div className="header-navigation"><nav aria-label="主导航">{mainNav.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}<InstituteMenu items={instituteNav}/></nav></div>
    <div className="header-tools"><Link className="header-search" href="/search" aria-label="全站搜索"><Search aria-hidden="true"/></Link><LanguageMenu/></div><MobileMenu items={mainNav}><InstituteMenu items={instituteNav}/><Link href="/search">全站搜索</Link></MobileMenu></header></>;
}

export function Footer() {
  return <footer className="footer footer-unified" id="contact">
    <div className="footer-main">
      <div className="footer-brand-block"><Link href="/" className="footer-logo-frame"><img src="/media-web-v24/brand/heoa-logo-web-v24.webp" alt="HEOA 健康服务与产业组织研究" loading="lazy"/></Link><p className="footer-motto">评估助力更健康的社会</p><small>BETTER EVIDENCE FOR A HEALTHIER SOCIETY</small><div className="footer-related-links" aria-label="相关链接"><a href="http://wcsph.scu.edu.cn/index/yqlj.htm" target="_blank" rel="noopener noreferrer">华西公共卫生学院</a><a href="http://www.scu.edu.cn/" target="_blank" rel="noopener noreferrer">四川大学</a><a href="http://wc4hospital.scu.edu.cn/index/sy.htm" target="_blank" rel="noopener noreferrer">华西第四医院</a></div></div>
      <div className="footer-platforms"><h3>机构平台</h3>{instituteNav.map(([href,label])=><Link key={href} href={href} {...(href.startsWith('https:') ? {target:'_blank',rel:'noopener noreferrer'} : {})}>{label}</Link>)}</div>
      <div className="footer-contact"><h3>联系我们</h3><p><Mail aria-hidden="true"/><a href="mailto:heoagroup@outlook.com">heoagroup@outlook.com</a></p><p><Phone aria-hidden="true"/><span>+86-028-85503396<br/>+86-028-85501096</span></p><p><MapPin aria-hidden="true"/><span>四川省成都市武侯区人民南路三段17号行政楼附楼</span></p></div>
      <a className="footer-connect" href="/media-web-v24/brand/heoa-wechat-web-v24.webp" target="_blank" rel="noopener noreferrer" aria-label="查看 HEOA 微信二维码大图"><span className="footer-qr"><img src="/media-web-v24/brand/heoa-wechat-web-v24.webp" alt="HEOA 官方微信二维码" loading="lazy"/></span><span>扫码了解更多<small>Scan to connect ↗</small></span></a>
    </div><div className="footer-bottom"><span>Copyright © 2026 HEOA. All Rights Reserved.</span><Link href="/search">全站搜索</Link></div></footer>;
}

export function CenterHeader() {
  return <><RevealObserver/><a className="skip-link center-skip-link" href="#main-content">跳到主要内容</a><div className="center-parent"><Link href="/">HEOA智库</Link><span>/</span><span>健康城市发展研究中心</span></div><header className="center-header"><Link href="/think-tank/healthy-cities" className="center-logo"><img src="/media-web-v24/brand/healthy-cities-logo-web-v24.webp" alt="健康城市发展研究中心"/><span><strong>健康城市发展研究中心</strong><small>Health City Development Research Center</small></span></Link><nav>{centerNav.map(([href,label])=><Link key={href} className={label === 'HEOA智库' ? 'center-root-link' : undefined} href={href}>{label}</Link>)}</nav><div className="header-tools center-header-tools"><Link className="header-search" href="/search" aria-label="全站搜索"><Search aria-hidden="true"/></Link><LanguageMenu/></div><MobileMenu items={[...centerNav, ['/search', '全站搜索']]}/></header></>;
}

export function CenterFooter() {
  return <footer className="center-footer"><div><h3>健康城市发展研究中心</h3><p><MapPin/> 四川省成都市武侯区人民南路三段17号行政楼附楼<br/>邮编 510000</p><p><Phone/> +86-028-85503396；+86-028-85501096</p><p><Mail/> scuurbanhealth@outlook.com</p></div><div><h3>友情链接｜Links</h3><a href="https://heoagroup.org/" target="_blank" rel="noopener noreferrer">健康服务与产业组织研究团队（HEOA Group）</a><a href="https://bayesianstvc.github.io/" target="_blank" rel="noopener noreferrer">时空可解释研究组织 BSTVC</a><a href="https://scu-heoa-chronic.pages.dev/" target="_blank" rel="noopener noreferrer">整合式智慧慢病管理模式研究</a><a href="http://www.scu.edu.cn/" target="_blank" rel="noopener noreferrer">四川大学</a><a href="http://wcsph.scu.edu.cn/index/yqlj.htm" target="_blank" rel="noopener noreferrer">四川大学华西公共卫生学院</a></div><div><h3>医疗机构</h3><a href="http://www.wchscu.cn/index.html" target="_blank" rel="noopener noreferrer">华西医院</a><a href="http://wc4hospital.scu.edu.cn/index/sy.htm" target="_blank" rel="noopener noreferrer">华西第四医院</a><a href="http://www.motherchildren.com/" target="_blank" rel="noopener noreferrer">华西第二医院</a><a href="http://www.hxkq.org/" target="_blank" rel="noopener noreferrer">华西口腔医院</a></div><div className="center-copy">Copyright © 2026 健康城市发展研究中心</div></footer>;
}

export function MoreLink({href,children}:{href:string;children:React.ReactNode}) { return <Link className="more" href={href}>{children}<ArrowRight/></Link>; }
