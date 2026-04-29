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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface GameRecord {
  id: number;
  user_id: number;
  username: string;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

interface GameRecordsResponse {
  gameRecords: GameRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminGameRecordsPage() {
  const [data, setData] = useState<GameRecordsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState<GameRecord | null>(null);

  const fetchRecords = async (
    searchTerm: string = search,
    result: string = resultFilter,
    currentPage: number = page
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        result: result,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });
      const res = await fetch(`/api/admin/game-records?${params}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        console.error(result.error || "获取游戏记录失败");
      }
    } catch (error) {
      console.error("获取游戏记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords("", "", 1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRecords(search, resultFilter, 1);
  };

  const handleFilterChange = (value: string) => {
    setResultFilter(value);
    setPage(1);
    fetchRecords(search, value, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchRecords(search, resultFilter, newPage);
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
            <Input
              placeholder="搜索场景或用户名..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
          </form>
          <Select value={resultFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="failure">失败</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              <TableHead>用户</TableHead>
              <TableHead>场景</TableHead>
              <TableHead className="w-24">分数</TableHead>
              <TableHead className="w-24">状态</TableHead>
              <TableHead>游戏时间</TableHead>
              <TableHead className="w-32 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.gameRecords?.length ? (
              data.gameRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.username}</TableCell>
                  <TableCell>{record.scenario}</TableCell>
                  <TableCell>
                    <span className={record.final_score >= 40 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {record.final_score}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        record.result === "success"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }
                    >
                      {record.result === "success" ? "成功" : "失败"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.played_at), "yyyy-MM-dd HH:mm:ss", {
                      locale: zhCN,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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

      {/* 详情弹窗 */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>游戏记录详情</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRecord(null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">记录ID</p>
                  <p className="font-medium">{selectedRecord.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">用户</p>
                  <p className="font-medium">{selectedRecord.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">场景</p>
                  <p className="font-medium">{selectedRecord.scenario}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">最终分数</p>
                  <p className={`font-medium ${selectedRecord.final_score >= 40 ? "text-green-600" : "text-red-600"}`}>
                    {selectedRecord.final_score}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">结果</p>
                  <Badge
                    className={
                      selectedRecord.result === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {selectedRecord.result === "success" ? "成功" : "失败"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">游戏时间</p>
                  <p className="font-medium">
                    {format(new Date(selectedRecord.played_at), "yyyy-MM-dd HH:mm:ss", {
                      locale: zhCN,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}