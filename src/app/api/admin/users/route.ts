import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const client = getSupabaseClient();

    let query = client.from("users").select("id, username, created_at", { count: "exact" });

    if (search) {
      query = query.ilike("username", `%${search}%`);
    }

    const offset = (page - 1) * pageSize;
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        users: data || [],
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json(
      { success: false, error: "获取用户列表失败" },
      { status: 500 }
    );
  }
}