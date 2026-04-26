import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 注册
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

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: "用户名长度必须在3-20个字符之间" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度不能少于6个字符" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查用户名是否已存在
    const { data: existingUser } = await client
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "用户名已存在" },
        { status: 409 }
      );
    }

    // 密码哈希加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const { data, error } = await client
      .from("users")
      .insert({
        username: username,
        password: hashedPassword,
      })
      .select("id, username, created_at")
      .single();

    if (error) {
      console.error("注册失败:", error);
      return NextResponse.json(
        { error: "注册失败，请稍后重试" },
        { status: 500 }
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
    console.error("注册错误:", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
