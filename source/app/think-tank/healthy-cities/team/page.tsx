import { MemberCard } from '@/components/member-card';
import { CenterFooter, CenterHeader } from '@/components/site-shell';
import { centerMembers } from '@/lib/content';
export default function CenterTeam(){return <><CenterHeader/><main id="main-content" tabIndex={-1} className="center-site"><section className="center-page-hero"><p>OUR PEOPLE</p><h1>中心成员</h1></section><section className="member-grid team-page" data-directory="healthy-cities" data-status="published">{centerMembers.map(member=><MemberCard member={member} key={member.id}/>)}</section></main><CenterFooter/></>}
