import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 获取用户游戏记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "缺少用户 ID" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查询用户的游戏记录
    const { data, error } = await client
      .from("game_records")
      .select("id, scenario, final_score, result, played_at")
      .eq("user_id", parseInt(userId))
      .order("played_at", { ascending: false });

    if (error) {
      console.error("查询游戏记录失败:", error);
      return NextResponse.json(
        { error: "查询失败，请稍后重试" },
        { status: 500 }
      );
    }

    // 格式化返回数据
    const records = (data || []).map((record) => ({
      id: record.id,
      scenario: record.scenario,
      finalScore: record.final_score,
      result: record.result,
      playedAt: record.played_at,
    }));

    // 计算统计数据
    const totalGames = records.length;
    const wins = records.filter((r) => r.result === "success").length;
    const losses = records.filter((r) => r.result === "failure").length;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    const avgScore = totalGames > 0
      ? Math.round(records.reduce((sum, r) => sum + r.finalScore, 0) / totalGames)
      : 0;

    return NextResponse.json({
      records,
      stats: {
        totalGames,
        wins,
        losses,
        winRate,
        avgScore,
      },
    });
  } catch (err) {
    console.error("获取游戏记录错误:", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
