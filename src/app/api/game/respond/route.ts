import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

interface Option {
  text: string;
  isGood: boolean;
}

interface Dialogue {
  role: "ai" | "user";
  content: string;
}

// 获取声音配置
function getVoiceConfig(voiceType: string): { speaker: string; emotion: string } {
  const voiceMap: Record<string, { speaker: string; emotion: string }> = {
    gentle_female: { speaker: "zh_female_vv_uranus_bigtts", emotion: "温柔、撒娇" },
    fierce_female: { speaker: "zh_female_meilinvyou_saturn_bigtts", emotion: "强势、御姐" },
    cute_female: { speaker: "saturn_zh_female_keainvsheng_tob", emotion: "可爱、软萌" },
    deep_male: { speaker: "zh_male_m191_uranus_bigtts", emotion: "低沉、磁性" },
    gentle_male: { speaker: "zh_male_dayi_saturn_bigtts", emotion: "温柔、体贴" },
  };
  return voiceMap[voiceType] || voiceMap.gentle_female;
}

// 根据好感度获取情绪状态
function getEmotionalState(affection: number): string {
  if (affection < 0) {
    return "非常生气，可能冷暴力或激烈质问";
  } else if (affection < 20) {
    return "还在生气，但愿意听你说";
  } else if (affection < 40) {
    return "开始软化，嘴上生气但语气缓和";
  } else {
    return "快被哄好了，态度明显好转";
  }
}

// 获取对方角色描述
function getCharacterDescription(gender: string): string {
  if (gender === "female") {
    return "女朋友（女性角色）";
  } else {
    return "男朋友（男性角色）";
  }
}

// 生成对话的系统提示
function getSystemPrompt(
  gender: string,
  scene: string,
  history: Dialogue[],
  currentAffection: number,
  round: number,
  selectedOption: string,
  voiceType: string
): string {
  const voiceConfig = getVoiceConfig(voiceType);
  const character = getCharacterDescription(gender);
  const emotionalState = getEmotionalState(currentAffection);

  const historyText = history
    .map((d) => (d.role === "ai" ? `${character}：${d.content}` : `用户：${d.content}`))
    .join("\n");

  return `你是${character}，正在生气的状态。
当前场景：${scene}
当前好感度：${currentAffection}/100（范围 -50 到 100）
当前回合：第 ${round} 轮/共 10 轮
对方情绪：${emotionalState}
声音风格：${voiceConfig.emotion}

对话历史：
${historyText}

用户刚才说："${selectedOption}"

现在请根据用户的回复，生成你的下一句话和6个选项。

要求：
1. 你的回复要和用户的选项相关，是一段自然的对话
2. 根据好感度调整语气：
   - 好感度 < 0：非常生气，冷漠或激烈质问
   - 好感度 0-20：还在生气但愿意听
   - 好感度 20-40：开始软化，嘴硬但语气缓和
   - 好感度 >= 40：快被哄好了，态度明显好转
3. 回复要有情绪变化，要自然
4. 好选项要让人感觉真诚，减分选项要有1-2个搞笑的

回复格式为JSON：
{
  "dialogue": "你说的话（10-50字，要符合当前情绪状态）",
  "affectionChange": 加减分值（好选项+5到+20，坏选项-5到-30）,
  "options": [
    {"text": "好的选项1", "isGood": true},
    {"text": "好的选项2", "isGood": true},
    {"text": "普通减分选项1", "isGood": false},
    {"text": "普通减分选项2", "isGood": false},
    {"text": "搞笑奇葩选项1", "isGood": false},
    {"text": "搞笑奇葩选项2", "isGood": false}
  ]
}

注意：affectionChange 必须是整数，可以是负数`;
}

// 生成游戏结束对话的系统提示
function getGameOverPrompt(
  gender: string,
  success: boolean,
  voiceType: string
): string {
  const voiceConfig = getVoiceConfig(voiceType);
  const character = getCharacterDescription(gender);

  if (success) {
    return `你是${character}，对方成功把你哄好了！
现在你要说出一句甜蜜的话，表达被哄好后的心情。

声音风格：${voiceConfig.emotion}

要求：
1. 甜蜜、撒娇、可爱
2. 15-30字
3. 要符合被哄好的心情
4. 可以带点小傲娇

请直接返回对话内容，不要包含其他内容。`;
  } else {
    return `你是${character}，对方没能把你哄好，游戏失败了。
现在你要说出一句"绝情"的话，但要俏皮可爱，不要真的让人不舒服。

声音风格：${voiceConfig.emotion}

要求：
1. 表达"这次真的生气了啊"的感觉
2. 15-30字
3. 俏皮但有点小委屈
4. 不要太伤人

请直接返回对话内容，不要包含其他内容。`;
  }
}

// 解析 LLM 返回的 JSON
function parseLLMResponse(
  content: string,
  isGameOver: boolean = false
): { dialogue: string; options?: Option[]; affectionChange?: number } {
  try {
    // 如果是游戏结束，只需要对话
    if (isGameOver) {
      return { dialogue: content.trim() };
    }

    // 尝试直接解析
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.dialogue && parsed.options && Array.isArray(parsed.options)) {
        return {
          dialogue: parsed.dialogue,
          options: parsed.options.map((opt: { text: string; isGood: boolean }) => ({
            text: opt.text,
            isGood: Boolean(opt.isGood),
          })),
          affectionChange: parsed.affectionChange || 0,
        };
      }
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  // 默认返回
  return {
    dialogue: "哼，你真的很过分！",
    options: [
      { text: "对不起，我错了", isGood: true },
      { text: "我下次一定注意", isGood: true },
      { text: "行吧随便你", isGood: false },
      { text: "你想太多了吧", isGood: false },
      { text: "要不我给你磕一个？", isGood: false },
      { text: "疯狂星期四请客行不行", isGood: false },
    ],
    affectionChange: 0,
  };
}

// 处理用户响应
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gender, scene, history, selectedOption, affection, round, voiceType } = body;

    if (!gender || !scene || !history || !selectedOption || affection === undefined || !round || !voiceType) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 计算新的好感度
    let newAffection = affection;

    // 检查是否是最后一轮
    const isLastRound = round >= 10;

    // 判断游戏是否结束
    let gameOver = false;
    let success = false;

    // 如果好感度已经 >= 40，直接胜利
    if (affection >= 40) {
      gameOver = true;
      success = true;
    }
    // 如果好感度 <= -50，直接失败
    else if (affection <= -50) {
      gameOver = true;
      success = false;
    }
    // 如果是最后一轮
    else if (isLastRound) {
      gameOver = true;
      success = affection >= 40;
    }

    let result: ReturnType<typeof parseLLMResponse>;

    if (gameOver) {
      // 生成游戏结束对话
      const messages: Array<{ role: "system" | "user"; content: string }> = [
        {
          role: "system",
          content: getGameOverPrompt(gender, success, voiceType),
        },
        { role: "user", content: "游戏结束，请生成最终对话" },
      ];

      const response = await client.invoke(messages, {
        model: "doubao-seed-2-0-lite-260215",
        temperature: 0.9,
      });

      result = parseLLMResponse(response.content, true);
    } else {
      // 生成下一轮对话
      const messages: Array<{ role: "system" | "user"; content: string }> = [
        {
          role: "system",
          content: getSystemPrompt(gender, scene, history, affection, round, selectedOption, voiceType),
        },
        { role: "user", content: "用户刚才说了那句话，现在请生成你的回复和选项" },
      ];

      const response = await client.invoke(messages, {
        model: "doubao-seed-2-0-lite-260215",
        temperature: 0.9,
      });

      result = parseLLMResponse(response.content);

      // 更新好感度
      const change = result.affectionChange || 0;
      newAffection = Math.max(-50, Math.min(100, newAffection + change));

      // 检查这次变化后是否游戏结束
      if (newAffection >= 40) {
        // 还需要一轮让对方说原谅的话
      } else if (newAffection <= -50) {
        gameOver = true;
        success = false;
      }
    }

    return NextResponse.json({
      dialogue: result.dialogue,
      options: result.options || [],
      affectionChange: result.affectionChange || 0,
      newAffection,
      gameOver,
      success,
    });
  } catch (error) {
    console.error("Game respond error:", error);
    return NextResponse.json(
      { error: "游戏响应失败" },
      { status: 500 }
    );
  }
}
