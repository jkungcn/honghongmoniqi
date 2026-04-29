import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const resultFilter = searchParams.get("result") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const client = getSupabaseClient();

    let query = client.from("game_records").select(
      `
        id,
        scenario,
        final_score,
        result,
        played_at,
        user_id,
        users ( username )
      `,
      { count: "exact" }
    );

    if (search) {
      query = query.or(`scenario.ilike.%${search}%,users.username.ilike.%${search}%`);
    }

    if (resultFilter) {
      query = query.eq("result", resultFilter);
    }

    const offset = (page - 1) * pageSize;
    const { data, count, error } = await query
      .order("played_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    // 格式化数据
    const formattedData = (data || []).map((item: any) => ({
      ...item,
      username: item.users?.username || "未知用户",
    }));

    return NextResponse.json({
      success: true,
      data: {
        gameRecords: formattedData,
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error("获取游戏记录失败:", error);
    return NextResponse.json(
      { success: false, error: "获取游戏记录失败" },
      { status: 500 }
    );
  }
}