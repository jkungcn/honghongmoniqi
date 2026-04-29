"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Gamepad2, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface OverviewData {
  userCount: number;
  gameRecordCount: number;
  newUserCount: number;
  newGameRecordCount: number;
  recentUsers: Array<{ id: number; username: string; created_at: string }>;
  recentGameRecords: Array<{
    id: number;
    scenario: string;
    result: string;
    played_at: string;
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/overview");
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("获取数据失败:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总用户数"
          value={data?.userCount || 0}
          icon={Users}
          color="blue"
          subValue={`+${data?.newUserCount || 0} 今日新增`}
        />
        <StatCard
          title="游戏记录"
          value={data?.gameRecordCount || 0}
          icon={Gamepad2}
          color="green"
          subValue={`+${data?.newGameRecordCount || 0} 今日新增`}
        />
        <StatCard
          title="活跃趋势"
          value="--"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="运行时长"
          value="--"
          icon={Clock}
          color="orange"
        />
      </div>

      {/* 最近动态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近用户 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近注册用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentUsers?.length ? (
                data.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.username}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(user.created_at), "yyyy-MM-dd HH:mm", {
                            locale: zhCN,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">暂无数据</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 最近游戏记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近游戏记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentGameRecords?.length ? (
                data.recentGameRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{record.scenario}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(record.played_at), "yyyy-MM-dd HH:mm", {
                          locale: zhCN,
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.result === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {record.result === "success" ? "成功" : "失败"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">暂无数据</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subValue,
}: {
  title: string;
  value: number | string;
  icon: any;
  color: "blue" | "green" | "purple" | "orange";
  subValue?: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            {subValue && <p className="text-sm text-green-600 mt-1">{subValue}</p>}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}