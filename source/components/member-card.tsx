import Link from './plain-link';
import { Users } from 'lucide-react';
import { assetPathForMedia, MemberRecord } from '@/lib/content';
import { MediaImage } from '@/components/media-image';

export function MemberCard({ member, compact = false, showcase = false }: { member: MemberRecord; compact?: boolean; showcase?: boolean }) {
  const image = assetPathForMedia(member.media, 'display');
  const isExternal = /^https?:\/\//.test(member.href);
  const portrait = image ? <MediaImage src={image} media={member.media} assetId={member.assetId} alt={`${member.displayName} 头像`} loading="lazy" decoding="async" sizes="(max-width: 440px) 100vw, (max-width: 760px) 50vw, (max-width: 1100px) 33vw, 20vw" fallbackLabel={`${member.displayName} 头像暂不可用`}/> : <span className="member-placeholder" aria-label={`${member.displayName} 头像待补充`}><Users aria-hidden="true"/><small>头像待补充</small></span>;
  const profileLinks = member.externalLinks?.length ? <span className="member-profile-links" aria-label={`${member.displayName} 外部资料`}>{member.externalLinks.map(item => <a href={item.href} key={`${member.id}-${item.href}`} target="_blank" rel="noopener noreferrer">{item.label}<span aria-hidden="true"> ↗</span></a>)}</span> : null;
  return <article id={`member-${member.id}`} data-member-id={member.id} data-member-role={member.role} data-member-status={member.status} data-member-featured={member.isFeatured ? 'true' : 'false'} data-status={member.status} data-reveal="member" className={`member-card member-card-refined${compact ? ' member-card-compact' : ''}${showcase ? ' member-card-showcase' : ''}${member.displayName === '宋超' ? ' member-song-chao' : ''}`}>
    <div className="member-portrait">{showcase ? portrait : <Link href={member.href} aria-label={`${member.displayName}，${member.role || '团队成员'}`} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{portrait}</Link>}</div>
      <div className="member-card-copy"><div className="member-card-heading"><h3>{member.displayName}</h3></div>
      {compact ? <><p>{member.role || member.bio.slice(0, 54) || '资料待补充'}</p><p className="member-organization">{member.organization}</p></> : <dl className="member-meta">
        <div><dt>职务</dt><dd>{member.role || '团队成员'}</dd></div>
        <div><dt>研究方向</dt><dd>{member.research || '研究方向待补充'}</dd></div>
        <div><dt>所属机构</dt><dd>{member.organization || 'HEOA 协作网络'}</dd></div>
        {member.email && <div><dt>联系</dt><dd><a href={`mailto:${member.email}`}>{member.email}</a></dd></div>}
        {profileLinks && <div className="member-meta-profiles"><dt>资料</dt><dd>{profileLinks}</dd></div>}
      </dl>}
      {compact && !showcase && profileLinks}
      </div>
  </article>;
}
