import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取统计数据
    const [
      { count: userCount },
      { count: gameRecordCount },
      { data: recentUsers },
      { data: recentGameRecords },
    ] = await Promise.all([
      client.from("users").select("*", { count: "exact", head: true }),
      client.from("game_records").select("*", { count: "exact", head: true }),
      client
        .from("users")
        .select("id, username, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      client
        .from("game_records")
        .select("id, scenario, result, played_at")
        .order("played_at", { ascending: false })
        .limit(5),
    ]);

    // 计算最近24小时的新增数据
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [{ count: newUserCount }, { count: newGameRecordCount }] = await Promise.all([
      client
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneDayAgo),
      client
        .from("game_records")
        .select("*", { count: "exact", head: true })
        .gte("played_at", oneDayAgo),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        userCount: userCount || 0,
        gameRecordCount: gameRecordCount || 0,
        newUserCount: newUserCount || 0,
        newGameRecordCount: newGameRecordCount || 0,
        recentUsers: recentUsers || [],
        recentGameRecords: recentGameRecords || [],
      },
    });
  } catch (error) {
    console.error("获取概览数据失败:", error);
    return NextResponse.json(
      { success: false, error: "获取数据失败" },
      { status: 500 }
    );
  }
}