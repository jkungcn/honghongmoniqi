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

// 场景配置
const SCENES: Record<string, { title: string; description: string }> = {
  anniversary: {
    title: "忘记纪念日",
    description: "今天是你们在一起三周年，你完全忘了",
  },
  no_reply: {
    title: "深夜不回消息",
    description: "你昨晚打游戏到凌晨三点，对方发了十几条消息你都没回",
  },
 异性聊天: {
    title: "被发现和异性聊天",
    description: "对方看到你和异性朋友的暧昧聊天记录",
  },
  cat_lost: {
    title: "把对方的猫弄丢了",
    description: "你帮对方照顾猫的时候，猫跑丢了",
  },
  embarrass: {
    title: "当众让对方没面子",
    description: "你在朋友聚会上开了一个过分的玩笑",
  },
};

// 获取对方角色描述
function getCharacterDescription(gender: string): string {
  if (gender === "female") {
    return "女朋友（女性角色）";
  } else {
    return "男朋友（男性角色）";
  }
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

// 生成对话的系统提示
function getSystemPrompt(
  gender: string,
  scene: string,
  affection: number,
  round: number,
  voiceType: string
): string {
  const voiceConfig = getVoiceConfig(voiceType);
  const character = getCharacterDescription(gender);
  const emotionalState = getEmotionalState(affection);

  return `你是${character}，正在生气的状态。
当前场景：${scene}
当前好感度：${affection}/100（范围 -50 到 100）
当前回合：第 ${round} 轮/共 10 轮
对方情绪：${emotionalState}
声音风格：${voiceConfig.emotion}

你的回复要求：
1. 模拟真实情侣吵架时的语气，俏皮可爱但不要真的让人不舒服
2. 对方说的话要和前面的对话连贯，是一段连续的对话
3. 根据好感度调整语气：
   - 好感度 < 0：非常生气，冷漠或激烈质问
   - 好感度 0-20：还在生气但愿意听
   - 好感度 20-40：开始软化，嘴硬但语气缓和
   - 好感度 >= 40：快被哄好了，态度明显好转
4. 回复要有情绪变化，要自然

现在请生成你的回复，格式为JSON：
{
  "dialogue": "你说的话（10-50字，要符合当前情绪状态）",
  "options": [
    {"text": "好的选项1（加分项，真诚道歉或具体弥补方案）", "isGood": true},
    {"text": "好的选项2（加分项，提起共同回忆等）", "isGood": true},
    {"text": "普通减分选项1（敷衍或找借口）", "isGood": false},
    {"text": "普通减分选项2（转移话题）", "isGood": false},
    {"text": "搞笑奇葩选项1（离谱到好笑）", "isGood": false},
    {"text": "搞笑奇葩选项2（更加离谱）", "isGood": false}
  ]
}

选项设计要求：
- 2个好选项：真诚道歉、具体弥补方案、提起共同美好回忆、表达理解对方感受
- 4个坏选项：
  - 1-2个普通减分：敷衍道歉、找借口、转移话题、反过来指责对方
  - 2-3个搞笑奇葩：比如"要不我给你跳一段？"、"我错了但你也有错啊"、"我请你吃疯狂星期四行不行"等
- 选项要自然，不能太刻意区分好坏
- 超过一行需要换行显示`;
}

// 生成最终回复的系统提示
function getFinalDialoguePrompt(
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
2. 10-30字
3. 要符合被哄好的心情
4. 可以带点小傲娇

请直接返回对话内容，不要包含其他内容。`;
  } else {
    return `你是${character}，对方没能把你哄好，游戏失败了。
现在你要说出一句"绝情"的话，但要俏皮可爱，不要真的让人不舒服。

声音风格：${voiceConfig.emotion}

要求：
1. 表达"这次真的生气了啊"的感觉
2. 10-30字
3. 俏皮但有点小委屈
4. 不要太伤人

请直接返回对话内容，不要包含其他内容。`;
  }
}

// 解析 LLM 返回的 JSON
function parseLLMResponse(content: string): { dialogue: string; options: Option[] } {
  try {
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
        };
      }
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  // 默认返回
  return {
    dialogue: "我真的好生气啊！",
    options: [
      { text: "对不起，我错了", isGood: true },
      { text: "我下次一定注意", isGood: true },
      { text: "行吧随便你", isGood: false },
      { text: "你想太多了吧", isGood: false },
      { text: "要不我给你磕一个？", isGood: false },
      { text: "疯狂星期四请客行不行", isGood: false },
    ],
  };
}

// 开始游戏
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gender, scene, voiceType } = body;

    if (!gender || !scene || !voiceType) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const sceneConfig = SCENES[scene] || {
      title: scene,
      description: scene,
    };

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建对话历史
    const history: Dialogue[] = [];
    history.push({
      role: "user",
      content: `场景：${sceneConfig.title}。${sceneConfig.description}`,
    });

    // 调用 LLM 生成第一轮对话
    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: getSystemPrompt(gender, sceneConfig.description, 20, 1, voiceType) },
      { role: "user", content: "现在请开始这段对话，对方生气的第一句话是什么？" },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.9,
    });

    const result = parseLLMResponse(response.content);

    // 随机决定好感度变化（模拟，不让用户知道）
    const affectionChange = result.options[0].isGood ? Math.floor(Math.random() * 16) + 5 : -Math.floor(Math.random() * 26) - 5;

    return NextResponse.json({
      dialogue: result.dialogue,
      options: result.options,
      affectionChange: 0, // 第一轮不显示好感度变化
      sceneTitle: sceneConfig.title,
      sceneDescription: sceneConfig.description,
    });
  } catch (error) {
    console.error("Game start error:", error);
    return NextResponse.json(
      { error: "游戏初始化失败" },
      { status: 500 }
    );
  }
}
