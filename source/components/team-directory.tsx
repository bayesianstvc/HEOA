'use client';

import { useMemo, useState } from 'react';
import { MemberCard } from '@/components/member-card';
import type { MemberRecord } from '@/lib/content';

const filters = [
  ['all', '全部成员'],
  ['doctoral', '博士生导师'],
  ['masters', '硕士生导师'],
] as const;

const matches = (member: MemberRecord, filter: string) => {
  if (filter === 'doctoral') return /博导|博士生导师/.test(member.role);
  if (filter === 'masters') return /硕导|硕士(?:研究)?生导师|博导|博士生导师/.test(member.role);
  return true;
};

export function TeamDirectory({ members }: { members: MemberRecord[] }) {
  const [filter, setFilter] = useState('all');
  const visible = useMemo(() => [...members]
    .sort((a, b) => Number(b.displayName === '潘杰') - Number(a.displayName === '潘杰') || a.titleRank - b.titleRank || a.sortOrder - b.sortOrder)
    .filter((member) => matches(member, filter)), [members, filter]);
  return <>
    <div className="team-filter" aria-label="按导师资格筛选成员">
      {filters.map(([value, label]) => <button type="button" key={value} className={filter === value ? 'is-active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
      <span aria-live="polite">显示 {visible.length} / {members.length} 位</span>
    </div>
    <div className="member-grid heoa-member-grid" data-directory="heoa" data-status="published">{visible.map((member) => <MemberCard member={member} key={member.id}/>)}</div>
  </>;
}
