import { ArchivePage } from '@/components/content-views';
import { disclosures } from '@/lib/content';
export default function DisclosurePage(){return <ArchivePage eyebrow="PUBLIC INFORMATION" title="信息公开" description="组织架构、资源下载、人才招聘及官方联系信息。" items={disclosures}/>}
