"use client";

import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  content: string;
  isAi: boolean;
  avatar?: React.ReactNode;
  showAudio?: boolean;
  onPlayAudio?: () => void;
  isPlaying?: boolean;
}

export function ChatBubble({
  content,
  isAi,
  avatar,
  showAudio,
  onPlayAudio,
  isPlaying,
}: ChatBubbleProps) {
  return (
    <div className={cn("flex gap-3", isAi ? "" : "flex-row-reverse")}>
      {/* 头像 */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
        {avatar || (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center text-white font-bold",
              isAi ? "bg-pink-400" : "bg-blue-400"
            )}
          >
            {isAi ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* 消息内容 */}
      <div className={cn("flex flex-col gap-1", isAi ? "items-start" : "items-end")}>
        <div
          className={cn(
            "relative max-w-[75%] px-4 py-3 rounded-2xl",
            isAi
              ? "bg-white border border-gray-200 rounded-tl-md"
              : "bg-pink-500 text-white rounded-tr-md"
          )}
        >
          <p className="leading-relaxed whitespace-pre-wrap">{content}</p>

          {/* 音频播放按钮 */}
          {isAi && showAudio && (
            <button
              onClick={onPlayAudio}
              className={cn(
                "mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                isPlaying
                  ? "bg-pink-100 text-pink-600"
                  : "bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-500"
              )}
            >
              {isPlaying ? (
                <svg className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              <span>{isPlaying ? "播放中" : "播放语音"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
