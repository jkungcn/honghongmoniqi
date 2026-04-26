"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

interface GameRecord {
  id: number;
  scenario: string;
  finalScore: number;
  result: "success" | "failure";
  playedAt: string;
}

interface Stats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  avgScore: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recordsLoading, setRecordsLoading] = useState(true);

  // 重定向未登录用户
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 获取游戏记录
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;

      try {
        const res = await fetch(`/api/game/records?userId=${user.id}`);
        const data = await res.json();

        if (res.ok) {
          setRecords(data.records);
          setStats(data.stats);
        }
      } catch (err) {
        console.error("获取游戏记录失败:", err);
      } finally {
        setRecordsLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString("zh-CN");
  };

  // 场景名称映射
  const getScenarioLabel = (scenario: string) => {
    const map: Record<string, string> = {
      "忘记纪念日": "忘记纪念日",
      "深夜不回消息": "深夜不回消息",
      "被发现和异性聊天": "被发现和异性聊天",
      "把对方的猫弄丢了": "把对方的猫弄丢了",
      "当众让对方没面子": "当众让对方没面子",
    };
    return map[scenario] || scenario;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-100">
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
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{user.username}</h1>
              <p className="text-gray-500 text-sm">
                注册于 {new Date(user.createdAt).toLocaleDateString("zh-CN")}
              </p>
            </div>
          </div>

          {/* 统计数据 */}
          {stats && stats.totalGames > 0 && (
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-pink-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-pink-600">{stats.totalGames}</div>
                <div className="text-xs text-pink-500">总场次</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
                <div className="text-xs text-green-500">胜利</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.losses}</div>
                <div className="text-xs text-gray-500">失败</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.winRate}%</div>
                <div className="text-xs text-purple-500">胜率</div>
              </div>
            </div>
          )}
        </div>

        {/* 游戏记录列表 */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">游戏记录</h2>

          {recordsLoading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-gray-500 mb-4">还没有游戏记录</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
              >
                开始游戏
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    record.result === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {record.result === "success" ? "🎉" : "😢"}
                      </span>
                      <span className={cn(
                        "font-bold",
                        record.result === "success" ? "text-green-600" : "text-gray-600"
                      )}>
                        {record.result === "success" ? "通关成功" : "通关失败"}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {formatTime(record.playedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      场景：{getScenarioLabel(record.scenario)}
                    </span>
                    <span className={cn(
                      "font-bold",
                      record.finalScore >= 40 ? "text-green-600" :
                      record.finalScore >= 20 ? "text-yellow-600" : "text-red-500"
                    )}>
                      好感度：{record.finalScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
