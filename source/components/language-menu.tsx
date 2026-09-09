'use client';

import { Languages } from 'lucide-react';

const languages = [
  ['en', 'English'], ['ja', '日本語'], ['ko', '한국어'], ['fr', 'Français'],
  ['de', 'Deutsch'], ['es', 'Español'], ['ar', 'العربية'],
];

export function LanguageMenu() {
  const translate = (language: string) => {
    const path = window.location.pathname + window.location.search;
    const isLocalPreview = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    const sourceUrl = isLocalPreview ? `https://heoagroup.org${path}` : window.location.href;
    window.location.href = `https://translate.google.com/translate?sl=zh-CN&tl=${language}&u=${encodeURIComponent(sourceUrl)}`;
  };
  return <details className="language-menu"><summary aria-label="Language / 选择语言" title="Language / 选择语言"><Languages aria-hidden="true"/></summary><div>{languages.map(([code, label]) => <button type="button" key={code} lang={code} onClick={() => translate(code)}>{label}</button>)}</div></details>;
}
