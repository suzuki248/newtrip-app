/**
 * 交通費を推定するサービス
 */
import { callGeminiAPI, parseJSONResponse } from './aiService';

/**
 * 出発地から目的地までの最も安い交通費を推定
 * @param {Object} origin - { lat, lng } または文字列の住所
 * @param {string} destination - 目的地名
 * @returns {Promise<number>} - 推定された日本円の費用
 */
export const estimateTransportCost = async (origin, destination) => {
    let originStr = origin;
    if (typeof origin === 'object' && origin.lat && origin.lng) {
        originStr = `Coordinates: ${origin.lat}, ${origin.lng}`;
    }

    const prompt = `
あなたは旅行アシスタントです。
以下の出発地から日本国内の目的地までの、大人1人分の最も安い片道交通費（電車、バス、または飛行機）を推定してください。

出発地: ${originStr}
目的地: ${destination}

出発地が座標の場合は、まず最寄りの主要な駅/空港を見つけてください。
日本円での推定費用のみを数値で返してください。テキストや記号は含めないでください。
例: 12000
`;

    try {
        const responseText = await callGeminiAPI(prompt);
        // 念のため、数字以外の文字を削除します。小数点も含まれる可能性がありますが、通常 JPY は整数です。
        const cleaned = responseText.replace(/[^0-9]/g, '');
        const cost = parseInt(cleaned, 10);
        return isNaN(cost) ? 0 : cost;
    } catch (error) {
        console.error('Failed to estimate transport cost:', error);
        return 0; // エラー時のデフォルト値 0
    }
};

export default {
    estimateTransportCost
};
