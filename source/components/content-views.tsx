import Link from './plain-link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { assetPath, ContentRecord, formatDate, plainTextExcerpt } from '@/lib/content';
import { CenterFooter, CenterHeader, Footer, Header } from '@/components/site-shell';
import { ArchiveList } from '@/components/archive-list';
import { MediaImage } from '@/components/media-image';

export function ContentCard({item,compact=false}:{item:ContentRecord;compact?:boolean}) {
  const image = assetPath(item.featuredAssetId);
  const excerpt = plainTextExcerpt(item.excerpt);
  return <article className={`content-card${compact?' compact':''}${image?' has-image':' no-image'}`} data-content-id={item.id} data-status={item.status ?? 'published'} data-reveal="card">{image&&<Link className="card-image" href={`/content/${item.id}`}><MediaImage src={image} assetId={item.featuredAssetId} alt={item.title} loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 38vw" fallbackLabel="图片暂不可用"/></Link>}{!image&&<div className="card-mark" aria-hidden="true"><strong>{item.date.slice(0, 4) || '—'}</strong><span>{item.sourceLabel}</span></div>}<div className="card-copy"><p className="meta"><span>{item.sourceLabel}</span><time><CalendarDays/>{formatDate(item.date)}</time></p><h3><Link href={`/content/${item.id}`}>{item.title}</Link></h3>{!compact&&<p>{excerpt || '阅读全文查看完整资料。'}</p>}<Link className="read" href={`/content/${item.id}`}>阅读全文 <ArrowRight/></Link></div></article>;
}

export function ArchivePage({eyebrow,title,description,items,variant='main'}:{eyebrow:string;title:string;description:string;items:ContentRecord[];variant?:'main'|'center';showYearFilter?:boolean}) {
  const viewItems = items.map((item) => ({ id:item.id, title:item.title, excerpt:plainTextExcerpt(item.excerpt), sourceLabel:item.sourceLabel, category:item.category ?? item.section, date:item.date, displayDate:formatDate(item.date), image:assetPath(item.featuredAssetId), assetId:item.featuredAssetId, status:item.status ?? 'published', centerId:item.centerId ?? null }));
  const PageHeader = variant === 'center' ? CenterHeader : Header;
  const PageFooter = variant === 'center' ? CenterFooter : Footer;
  return <><PageHeader/><main id="main-content" tabIndex={-1} className={variant === 'center' ? 'center-site' : ''}><section className={variant === 'center' ? 'center-page-hero' : 'page-hero'}><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></section><section className="archive"><ArchiveList items={viewItems}/></section></main><PageFooter/></>;
}
