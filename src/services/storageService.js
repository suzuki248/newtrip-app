// src/services/storageService.js

const STORAGE_KEY = 'saved_trip_plans';

const storageService = {
    /**
     * 新しいプランをローカルストレージに保存
     * @param {Object} plan - 旅行プランオブジェクト
     */
    savePlan: (plan) => {
        try {
            const savedPlans = storageService.getPlans();
            // ID が存在しない場合は、ユニーク ID を生成
            const planToSave = {
                ...plan,
                id: plan.id || `plan_${Date.now()}`,
                savedAt: new Date().toISOString()
            };

            // ID による重複を避ける
            const filtered = savedPlans.filter(p => p.id !== planToSave.id);
            const newPlans = [planToSave, ...filtered];

            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));
            return planToSave;
        } catch (error) {
            console.error('Failed to save plan:', error);
            return null;
        }
    },

    /**
     * すべての保存されたプランを取得
     * @returns {Array} - 保存されたプランの配列
     */
    getPlans: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load plans:', error);
            return [];
        }
    },

    /**
     * ID でプランを削除
     * @param {string} id - プラン ID
     */
    deletePlan: (id) => {
        try {
            const savedPlans = storageService.getPlans();
            const filtered = savedPlans.filter(p => p.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Failed to delete plan:', error);
            return false;
        }
    }
};

export default storageService;
