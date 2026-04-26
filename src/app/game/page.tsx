"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HeartsBar } from "@/components/HeartsBar";
import { ChatBubble } from "@/components/ChatBubble";
import { OptionButton } from "@/components/OptionButton";
import { ResultScreen } from "@/components/ResultScreen";

interface Dialogue {
  role: "ai" | "user";
  content: string;
}

interface Option {
  text: string;
  isGood: boolean;
}

interface GameState {
  gender: "female" | "male";
  scene: string;
  voiceType: string;
  affection: number;
  round: number;
  dialogues: Dialogue[];
  currentDialogue: string;
  options: Option[];
  gameOver: boolean;
  success: boolean;
  isLoading: boolean;
  showResult: boolean;
}

export default function GamePage() {
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [finalAudioUri, setFinalAudioUri] = useState<string | undefined>();

  const [gameState, setGameState] = useState<GameState>({
    gender: "female",
    scene: "",
    voiceType: "gentle_female",
    affection: 20,
    round: 1,
    dialogues: [],
    currentDialogue: "",
    options: [],
    gameOver: false,
    success: false,
    isLoading: true,
    showResult: false,
  });

  // 生成语音
  const generateAudio = async (text: string, voiceType: string, affection: number) => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceType,
          affection,
        }),
      });

      const data = await response.json();
      if (data.audioUri) {
        audioRef.current = new Audio(data.audioUri);
        audioRef.current.onended = () => setIsPlayingAudio(false);
      }
    } catch (error) {
      console.error("Failed to generate audio:", error);
    }
  };

  // 播放音频
  const playAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  // 开始游戏
  useEffect(() => {
    const settings = sessionStorage.getItem("gameSettings");
    if (!settings) {
      router.push("/");
      return;
    }

    const { gender, scene, voiceType } = JSON.parse(settings);

    const startGame = async () => {
      try {
        const response = await fetch("/api/game", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gender,
            scene,
            voiceType,
          }),
        });

        const data = await response.json();

        if (data.error) {
          console.error("Game start error:", data.error);
          return;
        }

        setGameState((prev) => ({
          ...prev,
          gender: gender as "female" | "male",
          scene,
          voiceType,
          currentDialogue: data.dialogue,
          options: shuffleArray(data.options),
          dialogues: [{ role: "ai", content: data.dialogue }],
          isLoading: false,
        }));

        // 生成语音
        generateAudio(data.dialogue, voiceType, 20);
      } catch (error) {
        console.error("Failed to start game:", error);
      }
    };

    startGame();
  }, [router]);

  // 处理选项选择
  const handleOptionSelect = async (option: Option) => {
    if (gameState.isLoading || gameState.gameOver) return;

    setGameState((prev) => ({
      ...prev,
      isLoading: true,
      dialogues: [...prev.dialogues, { role: "user", content: option.text }],
    }));

    try {
      const response = await fetch("/api/game/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gender: gameState.gender,
          scene: gameState.scene,
          history: gameState.dialogues,
          selectedOption: option.text,
          affection: gameState.affection,
          round: gameState.round,
          voiceType: gameState.voiceType,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Respond error:", data.error);
        return;
      }

      if (data.gameOver) {
        // 保存最终分数
        const finalScore = data.newAffection;

        // 游戏结束
        setGameState((prev) => ({
          ...prev,
          dialogues: [...prev.dialogues, { role: "ai", content: data.dialogue }],
          affection: finalScore,
          gameOver: true,
          success: data.success,
          showResult: true,
          isLoading: false,
        }));

        // 生成最终语音
        const ttsResponse = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: data.dialogue,
            voiceType: gameState.voiceType,
            affection: data.newAffection,
          }),
        });

        const ttsData = await ttsResponse.json();
        if (ttsData.audioUri) {
          setFinalAudioUri(ttsData.audioUri);
          audioRef.current = new Audio(ttsData.audioUri);
        }
      } else {
        // 继续游戏
        setGameState((prev) => ({
          ...prev,
          dialogues: [...prev.dialogues, { role: "ai", content: data.dialogue }],
          currentDialogue: data.dialogue,
          options: shuffleArray(data.options),
          affection: data.newAffection,
          round: prev.round + 1,
          isLoading: false,
        }));

        // 生成新语音
        generateAudio(data.dialogue, gameState.voiceType, data.newAffection);
      }
    } catch (error) {
      console.error("Failed to respond:", error);
    }
  };

  // 重新开始
  const handleRestart = () => {
    sessionStorage.removeItem("gameSettings");
    router.push("/");
  };

  // 滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [gameState.dialogues]);

  // 渲染头像
  const renderAvatar = (isAi: boolean) => {
    if (isAi) {
      return (
        <div className="w-full h-full bg-pink-400 flex items-center justify-center text-white">
          {gameState.gender === "female" ? "👩" : "👨"}
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-blue-400 flex items-center justify-center text-white">
        😊
      </div>
    );
  };

  if (gameState.showResult) {
    return (
      <ResultScreen
        success={gameState.success}
        finalDialogue={gameState.dialogues[gameState.dialogues.length - 1]?.content || ""}
        audioUri={finalAudioUri}
        scene={getSceneTitle(gameState.scene)}
        finalScore={gameState.affection}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 顶部状态栏 */}
      <HeartsBar affection={gameState.affection} round={gameState.round} />

      {/* 聊天区域 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {/* 场景提示 */}
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm">
            💬 {getSceneTitle(gameState.scene)}
          </div>
        </div>

        {/* 对话列表 */}
        {gameState.dialogues.map((dialogue, index) => (
          <div
            key={index}
            className="animate-slideIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ChatBubble
              content={dialogue.content}
              isAi={dialogue.role === "ai"}
              avatar={renderAvatar(dialogue.role === "ai")}
              showAudio={dialogue.role === "ai" && index === gameState.dialogues.length - 1}
              onPlayAudio={playAudio}
              isPlaying={
                dialogue.role === "ai" &&
                index === gameState.dialogues.length - 1 &&
                isPlayingAudio
              }
            />
          </div>
        ))}

        {/* 加载中 */}
        {gameState.isLoading && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-pink-400 flex items-center justify-center text-white">
              {gameState.gender === "female" ? "👩" : "👨"}
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 选项区域 */}
      <div className="bg-white border-t border-gray-200 p-4 space-y-3">
        {gameState.options.map((option, index) => (
          <OptionButton
            key={index}
            text={option.text}
            index={index}
            onClick={() => handleOptionSelect(option)}
            disabled={gameState.isLoading || gameState.gameOver}
          />
        ))}
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
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// 获取场景标题
function getSceneTitle(sceneId: string): string {
  const scenes: Record<string, string> = {
    anniversary: "忘记纪念日",
    no_reply: "深夜不回消息",
    异性聊天: "被发现和异性聊天",
    cat_lost: "把对方的猫弄丢了",
    embarrass: "当众让对方没面子",
  };
  return scenes[sceneId] || sceneId;
}

// 打乱数组顺序
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
