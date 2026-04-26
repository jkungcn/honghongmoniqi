"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ResultScreenProps {
  success: boolean;
  finalDialogue: string;
  audioUri?: string;
  scene: string;
  finalScore: number;
  onRestart: () => void;
}

export function ResultScreen({
  success,
  finalDialogue,
  audioUri,
  scene,
  finalScore,
  onRestart,
}: ResultScreenProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showLoginTip, setShowLoginTip] = useState(false);
  const [onLeaderboard, setOnLeaderboard] = useState(false);

  // 保存游戏记录
  useEffect(() => {
    // 防止重复保存
    if (saved || showLoginTip) return;
    
    const saveRecord = async () => {
      if (loading) return;

      if (!user) {
        setShowLoginTip(true);
        return;
      }

      try {
        // 保存游戏记录
        const res = await fetch("/api/game/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            scenario: scene,
            finalScore: finalScore,
            result: success ? "success" : "failure",
          }),
        });

        if (res.ok) {
          setSaved(true);
        }

        // 保存到排行榜（只有成功通关才上榜）
        if (success) {
          const leaderboardRes = await fetch("/api/leaderboard/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              username: user.username,
              score: finalScore,
              scenario: scene,
            }),
          });

          if (leaderboardRes.ok) {
            const data = await leaderboardRes.json();
            if (data.updated) {
              setOnLeaderboard(true);
            }
          }
        }
      } catch (err) {
        console.error("保存游戏记录失败:", err);
      }
    };

    saveRecord();
  }, [user, loading, scene, finalScore, success, saved, showLoginTip]);

  const playAudio = () => {
    if (audioUri) {
      const audio = new Audio(audioUri);
      audio.play();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-pink-100 to-white flex flex-col items-center justify-center p-6">
      {/* 保存状态提示 */}
      {showLoginTip && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm animate-fadeIn">
          登录后可保存你的游戏记录
          <button
            onClick={() => router.push("/login")}
            className="ml-2 text-amber-600 hover:text-amber-800 font-medium"
          >
            去登录
          </button>
        </div>
      )}

      {saved && user && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm animate-fadeIn">
          您的游戏记录已经保存
        </div>
      )}

      {onLeaderboard && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm animate-fadeIn">
          恭喜上榜！查看 <button onClick={() => router.push("/leaderboard")} className="font-bold hover:underline">排行榜</button>
        </div>
      )}

      {/* 动画容器 */}
      <div className="relative w-48 h-48 mb-8">
        {success ? (
          // 撒花动画
          <div className="relative w-full h-full">
            {/* 心形 */}
            <svg
              className="w-32 h-32 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-500 animate-bounce"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {/* 撒花粒子 */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-3 h-3 rounded-full animate-confetti",
                  i % 3 === 0 ? "bg-pink-400" : i % 3 === 1 ? "bg-yellow-400" : "bg-purple-400"
                )}
                style={{
                  left: "50%",
                  top: "50%",
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${i * 30}deg) translateY(-60px)`,
                }}
              />
            ))}
          </div>
        ) : (
          // 心碎动画
          <div className="relative w-full h-full flex items-center justify-center">
            <svg
              className="w-32 h-32 text-gray-400 animate-pulse"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {/* 裂纹 */}
            <svg
              className="absolute w-32 h-32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M8 9l4 4 4-4" className="animate-crack" />
            </svg>
          </div>
        )}
      </div>

      {/* 结果标题 */}
      <h1 className={cn(
        "text-4xl font-bold mb-4",
        success ? "text-pink-500" : "text-gray-500"
      )}>
        {success ? "恭喜通关！" : "游戏结束"}
      </h1>

      {/* 分数显示 */}
      <div className={cn(
        "px-6 py-3 rounded-full mb-6",
        success ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-600"
      )}>
        <span className="font-bold">{finalScore}</span>
        <span className="text-sm ml-1">好感度</span>
      </div>

      {/* 最终对话 */}
      <div className={cn(
        "max-w-md w-full p-6 rounded-2xl mb-8",
        success ? "bg-pink-50 border border-pink-200" : "bg-gray-50 border border-gray-200"
      )}>
        <p className={cn(
          "text-lg text-center leading-relaxed",
          success ? "text-pink-700" : "text-gray-600"
        )}>
          &ldquo;{finalDialogue}&rdquo;
        </p>
      </div>

      {/* 播放语音按钮 */}
      {audioUri && (
        <button
          onClick={playAudio}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full mb-8 transition-all",
            "bg-white border-2 shadow-lg",
            success
              ? "border-pink-300 text-pink-600 hover:bg-pink-50"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          )}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>播放语音</span>
        </button>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          onClick={onRestart}
          className={cn(
            "w-full py-6 text-lg rounded-full transition-all",
            success
              ? "bg-pink-500 hover:bg-pink-600 text-white"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          )}
        >
          {success ? "再玩一次" : "重新挑战"}
        </Button>

        {user && (
          <Button
            onClick={() => router.push("/profile")}
            variant="outline"
            className="w-full py-6 text-lg rounded-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            查看我的记录
          </Button>
        )}

        {success && (
          <Button
            onClick={() => {
              // 分享功能
              if (navigator.share) {
                navigator.share({
                  title: "哄哄模拟器",
                  text: "我刚刚在哄哄模拟器通关了！你能挑战一下吗？",
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("链接已复制，快去分享给朋友吧！");
              }
            }}
            variant="outline"
            className={cn(
              "w-full py-6 text-lg rounded-full",
              "border-2 border-pink-300 text-pink-600 hover:bg-pink-50"
            )}
          >
            分享给朋友
          </Button>
        )}
      </div>

      {/* CSS 动画 */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) rotate(720deg);
          }
        }
        .animate-confetti {
          animation: confetti 1.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
