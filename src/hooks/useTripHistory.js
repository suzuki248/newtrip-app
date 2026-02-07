// hooks/useTripHistory.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'trip_app_history';
const MAX_HISTORY = 20;

export const useTripHistory = () => {
    const [history, setHistory] = useState([]);

    // マウント時に localStorage から履歴を読み込む
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }, []);

    // 履歴が変更されるたびに localStorage に保存
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }, [history]);

    const addToHistory = (item) => {
        setHistory(prev => {
            const newHistory = [{
                ...item,
                timestamp: new Date().toISOString(),
                id: `${item.type}_${Date.now()}_${Math.random()}`
            }, ...prev];

            // 直近の MAX_HISTORY 件のみを保持
            return newHistory.slice(0, MAX_HISTORY);
        });
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const removeFromHistory = (itemId) => {
        setHistory(prev => prev.filter(item => item.id !== itemId));
    };

    return {
        history,
        addToHistory,
        clearHistory,
        removeFromHistory
    };
};

export default useTripHistory;
