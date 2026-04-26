import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '哄哄模拟器 | 10轮内把TA哄好',
    template: '%s | 哄哄模拟器',
  },
  description:
    '情侣吵架不知道怎么哄对方？来试试哄哄模拟器！AI扮演正在生气的TA，通过选择题的方式，在10轮内把对方哄好。',
  keywords: [
    '哄哄模拟器',
    '情侣吵架',
    '哄人',
    '模拟器',
    '恋爱游戏',
    '情商训练',
  ],
  authors: [{ name: 'Coze Code Team', url: 'https://code.coze.cn' }],
  generator: 'Coze Code',
  openGraph: {
    title: '扣子编程 | 你的 AI 工程师已就位',
    description:
      '我正在使用扣子编程 Vibe Coding，让创意瞬间上线。告别拖拽，拥抱心流。',
    url: 'https://code.coze.cn',
    siteName: '扣子编程',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {isDev && <Inspector />}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
