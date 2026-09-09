import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HEOA｜健康服务与产业组织研究',
  description: 'HEOA 健康服务与产业组织研究团队官方网站，以专业研究服务健康中国建设。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
