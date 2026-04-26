import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 登录
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查询用户
    const { data, error } = await client
      .from("users")
      .select("id, username, password, created_at")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("查询用户失败:", error);
      return NextResponse.json(
        { error: "登录失败，请稍后重试" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 验证密码
    const passwordMatch = await bcrypt.compare(password, data.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        username: data.username,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error("登录错误:", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
