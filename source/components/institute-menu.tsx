'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from './plain-link';

export function InstituteMenu({ items }: { items: string[][] }) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: Event) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target) && menuRef.current) menuRef.current.open = false;
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuRef.current?.open) {
        menuRef.current.open = false;
        menuRef.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    document.addEventListener('keydown', closeWithEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, []);
  return <details className="institute-menu" ref={menuRef}>
    <summary>机构平台<ChevronDown aria-hidden="true"/></summary>
    <div className="institute-menu-panel" aria-label="HEOA 下属机构与研究平台">
      {items.map(([href, label]) => <Link key={href} href={href} {...(href.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{label}</Link>)}
    </div>
  </details>;
}
