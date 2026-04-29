"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface User {
  id: number;
  username: string;
  created_at: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchUsers = async (searchTerm: string = search, currentPage: number = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        console.error(result.error || "获取用户列表失败");
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers("", 1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchUsers(search, newPage);
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <Input
            placeholder="搜索用户名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="w-4 h-4 mr-2" />
            搜索
          </Button>
        </form>
        <div className="text-sm text-gray-500">
          共 {data?.total || 0} 条记录
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>用户名</TableHead>
              {/* TODO: 如果有status字段可以添加 */}
              <TableHead>注册时间</TableHead>
              <TableHead className="w-32 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.users?.length ? (
              data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), "yyyy-MM-dd HH:mm:ss", {
                      locale: zhCN,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="cursor-pointer">
                      查看
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {data && data.total > pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            显示 {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, data.total)} 条
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              第 {page} 页 / 共 {totalPages} 页
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}