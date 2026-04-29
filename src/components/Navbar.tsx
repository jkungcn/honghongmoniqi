"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💕</span>
            <span className="font-bold text-gray-800 hidden sm:inline">
              哄哄模拟器
            </span>
          </Link>

          {/* 右侧用户状态 */}
          <div className="flex items-center gap-3">
            {loading ? (
              <span className="text-gray-400 text-sm">加载中...</span>
            ) : user ? (
              <>
                {/* 已登录状态 */}
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-pink-500 text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-pink-50"
                  >
                    后台
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-pink-50 transition-colors"
                  >
                    <span className="w-7 h-7 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-gray-700 text-sm font-medium hidden sm:inline">
                      {user.username}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-pink-500 text-sm transition-colors px-2 py-1.5 rounded-full hover:bg-pink-50"
                  >
                    退出
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 未登录状态 */}
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-pink-500 text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-pink-50"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-all shadow-md shadow-pink-200"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
