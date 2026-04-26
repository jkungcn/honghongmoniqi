import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 更新排行榜（保存或更新用户的最高分）
export async function POST(request: NextRequest) {
  try {
    const { userId, username, score, scenario } = await request.json();

    // 验证输入
    if (!userId || !username || score === undefined || !scenario) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: "分数超出范围" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查询用户当前记录
    const { data: existing } = await client
      .from("leaderboard")
      .select("id, best_score")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      // 如果新分数更高，则更新
      if (score > existing.best_score) {
        const { data, error } = await client
          .from("leaderboard")
          .update({
            best_score: score,
            username: username,
            scenario: scenario,
            achieved_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select("id, user_id, username, best_score, scenario, achieved_at")
          .single();

        if (error) {
          console.error("更新排行榜失败:", error);
          return NextResponse.json(
            { error: "更新失败，请稍后重试" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          updated: true,
          record: {
            userId: data.user_id,
            username: data.username,
            bestScore: data.best_score,
            scenario: data.scenario,
            achievedAt: data.achieved_at,
          },
        });
      }

      // 分数没有更高，返回现有记录
      return NextResponse.json({
        success: true,
        updated: false,
        message: "分数未超过当前记录",
      });
    }

    // 创建新记录
    const { data, error } = await client
      .from("leaderboard")
      .insert({
        user_id: userId,
        username: username,
        best_score: score,
        scenario: scenario,
      })
      .select("id, user_id, username, best_score, scenario, achieved_at")
      .single();

    if (error) {
      console.error("创建排行榜记录失败:", error);
      return NextResponse.json(
        { error: "保存失败，请稍后重试" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: true,
      record: {
        userId: data.user_id,
        username: data.username,
        bestScore: data.best_score,
        scenario: data.scenario,
        achievedAt: data.achieved_at,
      },
    });
  } catch (err) {
    console.error("更新排行榜错误:", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
