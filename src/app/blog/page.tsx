"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Article {
  slug: string;
  title: string;
  summary: string;
  emoji: string;
  createdAt: string;
}

export default function BlogPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/blog");
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">💡 恋爱攻略</h1>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <p className="text-gray-600 text-center mb-8">
          学会这些恋爱技巧，让你们的感情更甜蜜 💕
        </p>

        {isLoading ? (
          // 加载状态
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 文章列表
          <div className="space-y-4">
            {articles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] border border-gray-100 animate-slideIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl">
                    {article.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-800 mb-2 leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <span>{article.createdAt}</span>
                      <span>·</span>
                      <span className="text-pink-500">阅读全文 →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-12 text-center">
          <div className="inline-block px-6 py-4 bg-pink-50 rounded-2xl border border-pink-100">
            <p className="text-pink-600 text-sm">
              更多攻略正在创作中...
              <br />
              <span className="text-xs text-gray-500">先玩一局哄哄模拟器练练手？</span>
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-3 px-4 py-2 bg-pink-500 text-white text-sm rounded-full hover:bg-pink-600 transition-colors"
            >
              去玩游戏
            </button>
          </div>
        </div>
      </div>

      {/* CSS 动画 */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
