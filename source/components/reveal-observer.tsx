'use client';

import { useEffect } from 'react';

export function RevealObserver() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer: IntersectionObserver | undefined;

    const scan = () => {
      const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
      nodes.forEach((node, index) => {
        if (node.dataset.revealState) return;
        node.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
        if (reduce || !('IntersectionObserver' in window)) {
          node.dataset.revealState = 'visible';
          return;
        }
        node.dataset.revealState = 'pending';
        observer?.observe(node);
      });
    };

    if ('IntersectionObserver' in window && !reduce) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target as HTMLElement;
          node.dataset.revealState = 'visible';
          observer?.unobserve(node);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    }

    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { observer?.disconnect(); mutations.disconnect(); };
  }, []);

  return null;
}
