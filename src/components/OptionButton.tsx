"use client";

import { cn } from "@/lib/utils";

interface OptionButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  index: number;
  className?: string;
}

export function OptionButton({ text, onClick, disabled, index, className }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full p-4 text-left rounded-2xl border-2 transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
        "bg-white border-pink-200 hover:border-pink-400",
        "text-gray-700 font-medium",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        "animate-fadeIn",
        className
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <span className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
          {String.fromCharCode(65 + index)}
        </span>
        <span className="flex-1 leading-relaxed whitespace-pre-wrap">{text}</span>
      </span>
    </button>
  );
}
