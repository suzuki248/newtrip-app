// services/databaseService.js
// 旅行プラン用の LocalStorage ベースのデータベースサービス

const STORAGE_KEYS = {
    TRIP_PLANS: 'trip_plans',
    CURRENT_USER_ID: 'current_user_id'
};

// ユニーク ID を生成
function generateId() {
    return `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 現在のユーザー ID を取得（簡略化のため - 本番環境では認証を使用してください）
function getCurrentUserId() {
    let userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!userId) {
        userId = `user_${Date.now()}`;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    }
    return userId;
}

/**
 * localStorage からすべての旅行プランを取得
 */
function getAllPlans() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.TRIP_PLANS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading trip plans:', error);
        return [];
    }
}

/**
 * すべての旅行プランを localStorage に保存
 */
function saveAllPlans(plans) {
    try {
        localStorage.setItem(STORAGE_KEYS.TRIP_PLANS, JSON.stringify(plans));
    } catch (error) {
        console.error('Error saving trip plans:', error);
        throw new Error('Failed to save trip plans');
    }
}

/**
 * 新しい旅行プランを保存
 * @param {Object} planData - 旅行プランデータ
 * @returns {Object} - ID 付きの保存されたプラン
 */
export function saveTripPlan(planData) {
    const plans = getAllPlans();

    const newPlan = {
        id: generateId(),
        userId: getCurrentUserId(),
        ...planData,
        status: planData.status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    plans.push(newPlan);
    saveAllPlans(plans);

    return newPlan;
}

/**
 * 現在のユーザーのすべての旅行プランを取得
 * @param {string} status - オプションのステータスフィルター（'draft', 'confirmed', 'completed'）
 * @returns {Array} - 旅行プランの配列
 */
export function getTripPlans(status = null) {
    const userId = getCurrentUserId();
    const allPlans = getAllPlans();

    let userPlans = allPlans.filter(plan => plan.userId === userId);

    if (status) {
        userPlans = userPlans.filter(plan => plan.status === status);
    }

    // 作成日時順にソート（新しい順）
    return userPlans.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );
}

/**
 * ID で特定の旅行プランを取得
 * @param {string} planId - プラン ID
 * @returns {Object|null} - 旅行プラン、または見つからない場合は null
 */
export function getTripPlan(planId) {
    const plans = getAllPlans();
    return plans.find(plan => plan.id === planId) || null;
}

/**
 * 既存の旅行プランを更新
 * @param {string} planId - プラン ID
 * @param {Object} updates - 更新されたフィールド
 * @returns {Object|null} - 更新されたプラン、または見つからない場合は null
 */
export function updateTripPlan(planId, updates) {
    const plans = getAllPlans();
    const index = plans.findIndex(plan => plan.id === planId);

    if (index === -1) {
        return null;
    }

    plans[index] = {
        ...plans[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    saveAllPlans(plans);
    return plans[index];
}

/**
 * 旅行プランを削除
 * @param {string} planId - プラン ID
 * @returns {boolean} - 削除された場合は true、見つからない場合は false
 */
export function deleteTripPlan(planId) {
    const plans = getAllPlans();
    const filteredPlans = plans.filter(plan => plan.id !== planId);

    if (filteredPlans.length === plans.length) {
        return false; // プランが見つかりません
    }

    saveAllPlans(filteredPlans);
    return true;
}

/**
 * 旅行の統計情報を取得
 * @returns {Object} - 統計オブジェクト
 */
export function getTripStatistics() {
    const plans = getTripPlans();

    return {
        total: plans.length,
        draft: plans.filter(p => p.status === 'draft').length,
        confirmed: plans.filter(p => p.status === 'confirmed').length,
        completed: plans.filter(p => p.status === 'completed').length,
        totalBudget: plans.reduce((sum, p) => sum + (p.budget || 0), 0),
        averageBudget: plans.length > 0
            ? plans.reduce((sum, p) => sum + (p.budget || 0), 0) / plans.length
            : 0
    };
}

/**
 * すべての旅行プランをクリア（テスト/開発用）
 */
export function clearAllPlans() {
    localStorage.removeItem(STORAGE_KEYS.TRIP_PLANS);
}

export default {
    saveTripPlan,
    getTripPlans,
    getTripPlan,
    updateTripPlan,
    deleteTripPlan,
    getTripStatistics,
    clearAllPlans
};
