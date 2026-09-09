import { ArchivePage } from '@/components/content-views';
import { healthyNews } from '@/lib/content';
export default function CenterNews(){return <ArchivePage eyebrow="CENTER UPDATES" title="新闻资讯" description="新闻、通知与中心既有研究动态统一呈现。" items={healthyNews} variant="center"/>}
