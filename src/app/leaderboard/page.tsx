"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  bestScore: number;
  scenario: string;
  achievedAt: string;
}

export default function LeaderboardPage() {
  const { user, loading } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  // 获取排行榜数据
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard?limit=20");
        const data = await res.json();

        if (res.ok) {
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error("获取排行榜失败:", err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days < 1) return "今天";
    if (days === 1) return "昨天";
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString("zh-CN");
  };

  // 获取排名样式
  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white";
    if (rank === 2) return "bg-gradient-to-br from-gray-300 to-gray-400 text-white";
    if (rank === 3) return "bg-gradient-to-br from-amber-600 to-amber-700 text-white";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">💕</span>
              <span className="font-bold text-gray-800">哄哄模拟器</span>
            </Link>
            <Link
              href="/"
              className="text-gray-500 hover:text-pink-500 text-sm font-medium transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full mb-4">
            <span className="text-xl">🏆</span>
            <span className="font-medium">排行榜</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">最高好感度排行榜</h1>
          <p className="text-gray-500 text-sm mt-1">仅显示成功通关的最佳成绩</p>
        </div>

        {/* 排行榜内容 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {fetchLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">加载中...</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-gray-500 mb-2">暂无排行榜数据</p>
              <p className="text-gray-400 text-sm">快去游戏，成为第一个上榜的吧！</p>
              <Link
                href="/"
                className="inline-block mt-4 px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
              >
                开始游戏
              </Link>
            </div>
          ) : (
            <>
              {/* 表头 */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <div className="col-span-1 text-center">排名</div>
                <div className="col-span-4">玩家</div>
                <div className="col-span-3 text-center">最高分</div>
                <div className="col-span-4 text-center">达成时间</div>
              </div>

              {/* 排行榜列表 */}
              <div className="divide-y divide-gray-100">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={cn(
                      "grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors",
                      user && entry.userId === user.id
                        ? "bg-purple-50"
                        : "hover:bg-gray-50"
                    )}
                  >
                    {/* 排名 */}
                    <div className="col-span-1 flex justify-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          getRankStyle(entry.rank)
                        )}
                      >
                        {entry.rank <= 3 ? (
                          <span>{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</span>
                        ) : (
                          entry.rank
                        )}
                      </div>
                    </div>

                    {/* 用户名 */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {entry.username}
                            {user && entry.userId === user.id && (
                              <span className="ml-1 text-xs text-purple-600 font-normal">(你)</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">{entry.scenario}</div>
                        </div>
                      </div>
                    </div>

                    {/* 最高分 */}
                    <div className="col-span-3 text-center">
                      <div className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold",
                        entry.bestScore >= 60 ? "bg-green-100 text-green-600" :
                        entry.bestScore >= 40 ? "bg-yellow-100 text-yellow-600" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        <span className="text-base">❤️</span>
                        {entry.bestScore}
                      </div>
                    </div>

                    {/* 达成时间 */}
                    <div className="col-span-4 text-center">
                      <span className="text-sm text-gray-500">
                        {formatTime(entry.achievedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            排行榜每场游戏通关后自动更新
          </p>
          {!user && (
            <p className="text-gray-500 text-sm mt-2">
              <Link href="/login" className="text-purple-500 hover:underline">登录</Link>
              {" "}后可参与排行榜竞争
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
