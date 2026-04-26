"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Article {
  slug: string;
  title: string;
  summary: string;
  emoji: string;
  createdAt: string;
  content: string;
}

export default function ArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    }
  }, [slug]);

  const fetchArticle = async (articleSlug: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/blog/${articleSlug}`);

      if (!response.ok) {
        throw new Error("文章不存在");
      }

      const data = await response.json();
      setArticle(data);
    } catch (err) {
      console.error("Failed to fetch article:", err);
      setError("文章加载失败");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100">
        {/* 顶部导航 */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push("/blog")}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              <span>返回</span>
            </button>
          </div>
        </div>

        {/* 加载状态 */}
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">文章不存在</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          >
            返回攻略列表
          </Link>
        </div>
      </div>
    );
  }

  // 处理文章内容，分段显示
  const paragraphs = article.content.split("\n").filter((p) => p.trim());

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/blog")}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            <span>返回</span>
          </button>
        </div>
      </div>

      {/* 文章内容 */}
      <article className="max-w-lg mx-auto px-4 py-8">
        {/* 文章头部 */}
        <header className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm mb-4">
            <span>{article.emoji}</span>
            <span>恋爱攻略</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4 leading-snug">
            {article.title}
          </h1>
          <p className="text-gray-500 text-sm">
            {article.createdAt}
          </p>
        </header>

        {/* 文章内容 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-slideUp">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-gray-700 leading-relaxed mb-4 last:mb-0 animate-content"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* 底部互动 */}
        <div className="mt-8 text-center">
          <div className="inline-block px-6 py-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl">
            <p className="text-gray-700 text-sm mb-3">
              学会了吗？来实战演练一下！
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition-all hover:scale-105"
            >
              去玩哄哄模拟器 🎮
            </button>
          </div>
        </div>

        {/* 推荐阅读 */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            更多攻略
          </h3>
          <Link
            href="/blog"
            className="flex items-center justify-center gap-2 py-3 text-pink-500 hover:text-pink-600 transition-colors"
          >
            <span>查看全部攻略</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </Link>
        </div>
      </article>

      {/* CSS 动画 */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes content {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-content {
          animation: content 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
