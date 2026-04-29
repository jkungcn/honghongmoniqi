"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Gamepad2, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/game-records", label: "游戏记录", icon: Gamepad2 },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // TODO: 添加管理员检查，目前仅检查是否登录
  const isAdmin = true; // 临时开放，实际使用时应该检查用户角色

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先登录</p>
          <Button asChild>
            <Link href="/login">去登录</Link>
          </Button>
        </div>
      </div>
    );
  }

  // TODO: 实际项目中应该检查isAdmin
  /*
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">无权访问管理后台</p>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    );
  }
  */

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          {isSidebarOpen ? (
            <span className="font-bold text-lg text-gray-800">管理后台</span>
          ) : (
            <span className="font-bold text-lg text-gray-800">管</span>
          )}
        </div>

        {/* 导航 */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 底部 */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            {isSidebarOpen && <span>退出登录</span>}
          </Button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <h1 className="text-xl font-semibold text-gray-800">
              {navItems.find((item) => item.href === pathname)?.label || "概览"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">欢迎，{user.username}</span>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}