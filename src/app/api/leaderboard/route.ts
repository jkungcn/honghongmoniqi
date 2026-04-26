import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 获取排行榜
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const client = getSupabaseClient();

    // 查询前 N 名（按最高分排序）
    const { data, error } = await client
      .from("leaderboard")
      .select("id, user_id, username, best_score, scenario, achieved_at")
      .order("best_score", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("查询排行榜失败:", error);
      return NextResponse.json(
        { error: "查询失败，请稍后重试" },
        { status: 500 }
      );
    }

    // 格式化返回数据并添加排名
    const leaderboard = (data || []).map((item, index) => ({
      rank: index + 1,
      userId: item.user_id,
      username: item.username,
      bestScore: item.best_score,
      scenario: item.scenario,
      achievedAt: item.achieved_at,
    }));

    return NextResponse.json({
      leaderboard,
      total: leaderboard.length,
    });
  } catch (err) {
    console.error("获取排行榜错误:", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
