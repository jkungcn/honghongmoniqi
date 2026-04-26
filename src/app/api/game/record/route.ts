import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 保存游戏记录
export async function POST(request: NextRequest) {
  try {
    const { userId, scenario, finalScore, result } = await request.json();

    // 验证输入
    if (!userId || !scenario || finalScore === undefined || !result) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    if (!["success", "failure"].includes(result)) {
      return NextResponse.json(
        { error: "无效的结果状态" },
        { status: 400 }
      );
    }

    if (finalScore < -50 || finalScore > 100) {
      return NextResponse.json(
        { error: "分数超出范围" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 保存游戏记录
    const { data, error } = await client
      .from("game_records")
      .insert({
        user_id: userId,
        scenario: scenario,
        final_score: finalScore,
        result: result,
      })
      .select("id, scenario, final_score, result, played_at")
      .single();

    if (error) {
      console.error("保存游戏记录失败:", error);
      return NextResponse.json(
        { error: "保存失败，请稍后重试" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      record: {
        id: data.id,
        scenario: data.scenario,
        finalScore: data.final_score,
        result: data.result,
        playedAt: data.played_at,
      },
    });
  } catch (err) {
    console.error("保存游戏记录错误:", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
