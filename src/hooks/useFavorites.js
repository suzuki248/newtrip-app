// hooks/useFavorites.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'trip_app_favorites';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }, []);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }, [favorites]);

    const addFavorite = (item) => {
        setFavorites(prev => {
            // Check if already exists
            const exists = prev.some(fav => fav.id === item.id);
            if (exists) return prev;

            return [...prev, {
                ...item,
                addedAt: new Date().toISOString()
            }];
        });
    };

    const removeFavorite = (itemId) => {
        setFavorites(prev => prev.filter(fav => fav.id !== itemId));
    };

    const isFavorite = (itemId) => {
        return favorites.some(fav => fav.id === itemId);
    };

    const toggleFavorite = (item) => {
        if (isFavorite(item.id)) {
            removeFavorite(item.id);
        } else {
            addFavorite(item);
        }
    };

    return {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite
    };
};

export default useFavorites;
