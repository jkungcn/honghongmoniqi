"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface HeartsBarProps {
  affection: number;
  round: number;
  maxRounds?: number;
  className?: string;
}

export function HeartsBar({ affection, round, maxRounds = 10, className }: HeartsBarProps) {
  const [animatedAffection, setAnimatedAffection] = useState(affection);
  const [showChange, setShowChange] = useState(false);
  const [changeValue, setChangeValue] = useState(0);
  const [changeType, setChangeType] = useState<"up" | "down">("up");

  useEffect(() => {
    if (affection !== animatedAffection) {
      setChangeValue(affection - animatedAffection);
      setChangeType(affection > animatedAffection ? "up" : "down");
      setShowChange(true);

      // 动画过渡
      const timer = setTimeout(() => {
        setAnimatedAffection(affection);
      }, 300);

      const hideTimer = setTimeout(() => {
        setShowChange(false);
      }, 1500);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [affection, animatedAffection]);

  // 计算进度百分比
  // 好感度范围 -50 到 100，转换为 0% 到 100%
  const percentage = ((animatedAffection + 50) / 150) * 100;

  // 计算颜色
  const getColor = () => {
    if (animatedAffection < 0) return "bg-red-400";
    if (animatedAffection < 30) return "bg-orange-400";
    if (animatedAffection < 60) return "bg-yellow-400";
    return "bg-pink-500";
  };

  return (
    <div className={cn("w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-b", className)}>
      {/* 顶部信息 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="font-medium text-gray-700">
            好感度
          </span>
        </div>

        {/* 好感度变化动画 */}
        <div className="relative">
          {showChange && (
            <span
              className={cn(
                "absolute -top-6 left-1/2 transform -translate-x-1/2 font-bold text-lg animate-bounce",
                changeType === "up" ? "text-green-500" : "text-red-500"
              )}
            >
              {changeType === "up" ? "+" : ""}{changeValue}
            </span>
          )}
          <span
            className={cn(
              "text-lg font-bold",
              animatedAffection < 0 ? "text-red-500" : 
              animatedAffection < 30 ? "text-orange-500" : 
              animatedAffection < 60 ? "text-yellow-600" : 
              "text-pink-500"
            )}
          >
            {animatedAffection}
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <Progress
        value={percentage}
        className="h-3 bg-gray-200"
        indicatorClassName={getColor()}
      />

      {/* 轮次 */}
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>第 {round} 轮</span>
        <span>共 {maxRounds} 轮</span>
      </div>
    </div>
  );
}
