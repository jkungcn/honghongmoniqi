"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";

// 场景数据
const SCENES = [
  {
    id: "anniversary",
    title: "忘记纪念日",
    description: "今天是你们在一起三周年，你完全忘了",
    emoji: "🎂",
  },
  {
    id: "no_reply",
    title: "深夜不回消息",
    description: "你昨晚打游戏到凌晨三点，对方发了十几条消息你都没回",
    emoji: "📱",
  },
  {
    id: "异性聊天",
    title: "被发现和异性聊天",
    description: "对方看到你和异性朋友的暧昧聊天记录",
    emoji: "💬",
  },
  {
    id: "cat_lost",
    title: "把对方的猫弄丢了",
    description: "你帮对方照顾猫的时候，猫跑丢了",
    emoji: "🐱",
  },
  {
    id: "embarrass",
    title: "当众让对方没面子",
    description: "你在朋友聚会上开了一个过分的玩笑",
    emoji: "😬",
  },
];

// 语音类型
const VOICE_TYPES = [
  { id: "gentle_female", label: "温柔女声", description: "甜甜的，很会撒娇", emoji: "😊" },
  { id: "fierce_female", label: "霸道御姐", description: "强势但有魅力", emoji: "😎" },
  { id: "cute_female", label: "可爱软妹", description: "萌萌哒的声音", emoji: "🥰" },
  { id: "deep_male", label: "低沉男声", description: "磁性嗓音", emoji: "😏" },
  { id: "gentle_male", label: "温柔男声", description: "体贴暖男音", emoji: "🤗" },
];

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<"intro" | "gender" | "scene" | "voice">("intro");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [selectedScene, setSelectedScene] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("gentle_female");
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setStep("gender");
  };

  const handleGenderSelect = (g: "female" | "male") => {
    setGender(g);
    setStep("scene");
  };

  const handleSceneSelect = (sceneId: string) => {
    setSelectedScene(sceneId);
    setStep("voice");
  };

  const handleStartGame = async () => {
    setIsLoading(true);

    // 保存游戏设置到 sessionStorage
    sessionStorage.setItem(
      "gameSettings",
      JSON.stringify({
        gender,
        scene: selectedScene,
        voiceType: selectedVoice,
      })
    );

    // 跳转到游戏页面
    router.push(`/game`);
  };

  const handleBack = () => {
    if (step === "gender") {
      setStep("intro");
    } else if (step === "scene") {
      setStep("gender");
    } else if (step === "voice") {
      setStep("scene");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100">
      {/* 顶部导航栏 */}
      <Navbar />

      {/* 顶部装饰 */}
      <div className="relative h-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-1" style={{ color: '#2a47d5' }}>哄哄模拟器</h1>
            <p className="text-pink-500 text-base">10轮内把 TA 哄好！</p>
          </div>
        </div>
        {/* 漂浮的心形 */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-5 h-5 text-pink-300 animate-float opacity-60"
            )}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>



      {/* 主内容区 */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* 介绍页面 */}
        {step === "intro" && (
          <div className="text-center animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
              <div className="text-6xl mb-4">💕</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                还在为吵架烦恼？
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                情侣吵架不知道怎么哄对方？来试试这个模拟器！
                <br />
                AI 会扮演正在生气的 TA，你需要通过选择正确的回应来哄好对方。
              </p>

              <div className="bg-pink-50 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between text-sm text-pink-700">
                  <span>初始好感度</span>
                  <span className="font-bold">20/100</span>
                </div>
                <div className="flex items-center justify-between text-sm text-pink-700 mt-2">
                  <span>通关条件</span>
                  <span className="font-bold">10轮内 ≥ 40</span>
                </div>
              </div>

              <Button
                onClick={handleStart}
                className="w-full py-6 text-lg bg-pink-500 hover:bg-pink-600 text-white rounded-full"
              >
                开始挑战
              </Button>

              <Button
                onClick={() => router.push("/blog")}
                variant="outline"
                className="w-full mt-3 py-5 text-base border-2 border-pink-300 text-pink-600 hover:bg-pink-50 rounded-full"
              >
                💡 恋爱攻略
              </Button>

              <Button
                onClick={() => router.push("/leaderboard")}
                variant="outline"
                className="w-full mt-3 py-5 text-base border-2 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full"
              >
                🏆 排行榜
              </Button>
            </div>
          </div>
        )}

        {/* 性别选择 */}
        {step === "gender" && (
          <div className="animate-fadeIn">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 mb-6 hover:text-pink-500 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              <span>返回</span>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              选择 TA 的性别
            </h2>
            <p className="text-gray-500 text-center mb-8">
              不同性别的角色对话风格会有所不同哦
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleGenderSelect("female")}
                className={cn(
                  "p-6 rounded-2xl border-2 transition-all hover:scale-105",
                  gender === "female"
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 bg-white hover:border-pink-300"
                )}
              >
                <div className="text-5xl mb-3">👩</div>
                <div className={cn(
                  "font-bold",
                  gender === "female" ? "text-pink-600" : "text-gray-700"
                )}>
                  女朋友
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  可爱撒娇型
                </div>
              </button>

              <button
                onClick={() => handleGenderSelect("male")}
                className={cn(
                  "p-6 rounded-2xl border-2 transition-all hover:scale-105",
                  gender === "male"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                )}
              >
                <div className="text-5xl mb-3">👨</div>
                <div className={cn(
                  "font-bold",
                  gender === "male" ? "text-blue-600" : "text-gray-700"
                )}>
                  男朋友
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  有点傲娇型
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 场景选择 */}
        {step === "scene" && (
          <div className="animate-fadeIn">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 mb-6 hover:text-pink-500 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              <span>返回</span>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              选择吵架场景
            </h2>
            <p className="text-gray-500 text-center mb-8">
              回忆一下，你们因为什么吵起来的？
            </p>

            <div className="space-y-3">
              {SCENES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneSelect(scene.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02]",
                    selectedScene === scene.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 bg-white hover:border-pink-300"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{scene.emoji}</span>
                    <div className="flex-1">
                      <div className={cn(
                        "font-bold",
                        selectedScene === scene.id ? "text-pink-600" : "text-gray-700"
                      )}>
                        {scene.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {scene.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 声音选择 */}
        {step === "voice" && (
          <div className="animate-fadeIn">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 mb-6 hover:text-pink-500 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              <span>返回</span>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              选择 TA 的声音
            </h2>
            <p className="text-gray-500 text-center mb-8">
              给你的 TA 选一个声音吧
            </p>

            <div className="grid grid-cols-1 gap-3">
              {VOICE_TYPES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01]",
                    selectedVoice === voice.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 bg-white hover:border-pink-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{voice.emoji}</span>
                    <div className="flex-1">
                      <div className={cn(
                        "font-bold",
                        selectedVoice === voice.id ? "text-pink-600" : "text-gray-700"
                      )}>
                        {voice.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {voice.description}
                      </div>
                    </div>
                    {selectedVoice === voice.id && (
                      <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleStartGame}
              disabled={isLoading}
              className="w-full mt-8 py-6 text-lg bg-pink-500 hover:bg-pink-600 text-white rounded-full disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  加载中...
                </span>
              ) : (
                "开始游戏"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* CSS 动画 */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
