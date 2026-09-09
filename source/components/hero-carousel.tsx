'use client';

import Link from './plain-link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type HeroSlide = {
  href: string;
  image: string;
  title: string;
  date: string;
};

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const carouselRef = useRef<HTMLElement | null>(null);
  const inViewRef = useRef(true);

  useEffect(() => {
    const node = carouselRef.current;
    if (!node || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = Boolean(entry?.isIntersecting);
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (inViewRef.current) setActive((value) => (value + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (!slides.length) return null;

  const move = (step: number) => setActive((value) => (value + step + slides.length) % slides.length);

  return <section
    ref={carouselRef}
    className={`hero-carousel${paused ? ' is-paused' : ''}`}
    aria-label="HEOA 团队影像"
    onFocusCapture={() => setPaused(true)}
    onBlurCapture={() => setPaused(false)}
  >
    <div className="hero-slides">
      {slides.map((slide, index) => <Link
        href={slide.href}
        className={`hero-slide${index === active ? ' is-active' : ''}`}
        aria-hidden={index !== active}
        tabIndex={index === active ? 0 : -1}
        key={slide.href}
      >
        <img src={slide.image} alt={slide.title} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" sizes="(max-width: 760px) 100vw, 57vw"/>
        <span className="hero-slide-shade"/>
        <span className="hero-slide-copy"><small>团队动态 · {slide.date}</small><strong>{slide.title}</strong><em>查看相关内容 <ArrowRight/></em></span>
      </Link>)}
    </div>
    <div className="hero-carousel-controls">
      <button type="button" onClick={() => move(-1)} aria-label="上一张团队影像"><ArrowLeft/></button>
      <span>{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
      <button type="button" onClick={() => move(1)} aria-label="下一张团队影像"><ArrowRight/></button>
    </div>
    <div className="hero-carousel-dots" aria-label="选择团队影像">
      {slides.map((slide, index) => <button type="button" className={index === active ? 'is-active' : ''} onClick={() => setActive(index)} aria-label={`查看第 ${index + 1} 张：${slide.title}`} key={slide.href}/>)}
    </div>
  </section>;
}
