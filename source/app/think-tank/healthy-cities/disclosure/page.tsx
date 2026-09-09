import { ArchivePage } from '@/components/content-views';
import { healthyDisclosures } from '@/lib/content';
export default function CenterDisclosure(){return <ArchivePage eyebrow="PUBLIC INFORMATION" title="信息公开" description="公开资料、联系信息与相关说明统一归入本栏目。" items={healthyDisclosures} variant="center"/>}
