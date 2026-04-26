import { NextRequest, NextResponse } from "next/server";
import { TTSClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

// 获取声音配置
function getVoiceConfig(voiceType: string): string {
  const voiceMap: Record<string, string> = {
    gentle_female: "zh_female_vv_uranus_bigtts",
    fierce_female: "zh_female_meilinvyou_saturn_bigtts",
    cute_female: "saturn_zh_female_keainvsheng_tob",
    deep_male: "zh_male_m191_uranus_bigtts",
    gentle_male: "zh_male_dayi_saturn_bigtts",
  };
  return voiceMap[voiceType] || voiceMap.gentle_female;
}

// 根据情感状态调整语速
function getSpeechRate(affection: number): number {
  if (affection < 0) {
    return -10; // 生气时语速稍快
  } else if (affection < 30) {
    return -5;
  } else if (affection < 60) {
    return 0;
  } else if (affection < 80) {
    return 5; // 软化时稍慢，温柔
  } else {
    return 10; // 被哄好时更温柔
  }
}

// TTS 语音合成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceType, affection } = body;

    if (!text || !voiceType) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    const speaker = getVoiceConfig(voiceType);
    const speechRate = getSpeechRate(affection ?? 20);

    const response = await client.synthesize({
      uid: `game_${Date.now()}`,
      text,
      speaker,
      audioFormat: "mp3",
      speechRate,
    });

    return NextResponse.json({
      audioUri: response.audioUri,
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "语音合成失败" },
      { status: 500 }
    );
  }
}
