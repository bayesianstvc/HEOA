import { ArchivePage } from '@/components/content-views';
import { heoaNews } from '@/lib/content';

export default function NewsPage() {
  return <ArchivePage eyebrow="NEWS & UPDATES" title="新闻资讯" description="团队动态、会议活动与公共事务的完整记录。" items={heoaNews}/>;
}
