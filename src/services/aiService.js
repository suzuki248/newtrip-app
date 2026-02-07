// services/aiService.js
// Gemini API を使用した AI による旅行プランニングサービス

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "";
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

/**
 * リトライロジック付きで Gemini API を呼び出す
 */
async function callGeminiAPI(prompt, maxRetries = 3) {
  let delay = 1000;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        // 429 エラーまたは RESOURCE_EXHAUSTED
        if (response.status === 429 || error.error?.status === 'RESOURCE_EXHAUSTED') {
          throw new Error('API_QUOTA_EXCEEDED');
        }
        throw new Error(`API Error ${response.status}: ${error.error?.message || JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      if ((error.message.includes('RESOURCE_EXHAUSTED') || error.message === 'API_QUOTA_EXCEEDED') && i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      // リトライ回数を超えた場合、またはその他のエラーの場合は再スロー
      throw error;
    }
  }
}

/**
 * AI のレスポンスから JSON を解析（マークダウンのコードブロックを処理）
 */
function parseJSONResponse(text) {
  try {
    // マークダウンのコードブロックがあれば削除
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse JSON:', text);
    throw new Error('AI returned invalid JSON format');
  }
}

// 他のサービスで使用するために内部関数をエクスポート
export {
  callGeminiAPI,
  parseJSONResponse
};

/**
 * アクティビティに基づいて目的地の提案を取得
 * @param {string} activity - ユーザーがやりたいこと（例：「スカイダイビング」）
 * @returns {Promise<Array>} - 目的地のオブジェクトの配列
 */
export async function getDestinations(activity) {
  const prompt = `
あなたは旅行プランナーです。
ユーザーが「${activity}」をしたいと考えています。
この活動ができる日本国内の旅行先を3つ提案してください。

以下のJSON形式で返してください（マークダウンのコードブロックは不要）:
{
  "destinations": [
    {
      "id": "ユニークID（例: hokkaido-furano）",
      "name": "都道府県名 + 地域名（例: 北海道富良野）",
      "nameEn": "画像検索用の英語名 (例: Furano Hokkaido)",
      "description": "簡潔な説明（80文字以内）",
      "bestSeason": "ベストシーズン",
      "estimatedCost": 概算費用（数値のみ、例: 50000）,
      "highlights": ["特徴1", "特徴2", "特徴3"]
    }
  ]
}
`;

  const response = await callGeminiAPI(prompt);
  const data = parseJSONResponse(response);
  return data.destinations || [];
}

/**
 * 詳細な旅行日程を生成
 * @param {Object} params - 旅行パラメータ
 * @returns {Promise<Object>} - 完成した旅行プラン
 */
export async function generateItinerary(params) {
  const { activity, destination, startDate, endDate, budget, preferences } = params;

  // 日数を計算
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const prompt = `
あなたはプロの旅行プランナーです。以下の条件で${days}日間の詳細な旅行プランを作成してください:

【条件】
- 目的地: ${destination}
- メインアクティビティ: ${activity}
- 旅行期間: ${startDate} から ${endDate} (${days}日間)
- 予算: ${budget}円
${preferences ? `- その他の要望: ${preferences}` : ''}

以下のJSON形式で詳細なプランを返してください（マークダウンのコードブロックは不要）:
{
  "summary": "プランの概要（100文字以内）",
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "1日目のテーマ",
      "items": [
        {
          "time": "09:00-12:00",
          "activity": "活動名",
          "location": "場所",
          "lat": 緯度（数値）,
          "lng": 経度（数値）,
          "cost": 金額（数値）,
          "description": "詳細説明",
          "notes": "注意事項やTips"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "ホテル名",
      "type": "ホテル・旅館・民宿など",
      "address": "住所",
      "pricePerNight": 一泊あたりの料金（数値）,
      "totalNights": 宿泊数,
      "rating": 4.5,
      "amenities": ["アメニティ1", "アメニティ2"],
      "reason": "このホテルを選んだ理由"
    }
  ],
  "budgetBreakdown": {
    "transportation": 交通費（数値）,
    "accommodation": 宿泊費（数値）,
    "activities": アクティビティ費（数値）,
    "meals": 食費（数値）,
    "other": その他（数値）,
    "total": 合計金額（数値）
  },
  "tips": ["旅行のアドバイス1", "アドバイス2", "アドバイス3"],
  "packingList": ["持ち物1", "持ち物2", "持ち物3"]
}

注意: 予算${budget}円を大幅に超えないように計画してください。
出力言語: 日本語
`;

  const response = await callGeminiAPI(prompt);
  const data = parseJSONResponse(response);

  return {
    ...data,
    generatedAt: new Date().toISOString(),
    params: { activity, destination, startDate, endDate, budget }
  };
}

/**
 * さらなる景先の選択肢を取得
 * @param {string} activity - ユーザーがやりたいこと
 * @param {Array} excludeIds - 既に表示されている目的地の ID
 * @returns {Promise<Array>} - 新しい目的地のオブジェクトの配列
 */
export async function getMoreDestinations(activity, excludeIds = []) {
  const excludeList = excludeIds.join(', ');

  const prompt = `
あなたは旅行プランナーです。
ユーザーが「${activity}」をしたいと考えています。
${excludeList ? `ただし、以下の旅行先は既に提案済みです: ${excludeList}` : ''}

新しい日本国内の旅行先を3つ提案してください。

以下のJSON形式で返してください（マークダウンのコードブロックは不要）:
{
  "destinations": [
    {
      "id": "ユニークID",
      "name": "都道府県名 + 地域名",
      "nameEn": "画像検索用の英語名",
      "description": "簡潔な説明（80文字以内）",
      "bestSeason": "ベストシーズン",
      "estimatedCost": 概算費用（数値のみ）,
      "highlights": ["特徴1", "特徴2", "特徴3"]
    }
  ]
}
`;

  const response = await callGeminiAPI(prompt);
  const data = parseJSONResponse(response);
  return data.destinations || [];
}

export default {
  getDestinations,
  generateItinerary,
  getMoreDestinations,
  callGeminiAPI,
  parseJSONResponse
};
