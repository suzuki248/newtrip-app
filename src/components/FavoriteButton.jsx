// src/components/FavoriteButton.jsx
/**
 * Favorite Button Component
 * A functional button to toggle favorite status of an item.
 */
import React from 'react';

const FavoriteButton = ({ item, isFavorite, onToggle }) => {
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(item);
    };

    return (
        <button onClick={handleClick} title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            {isFavorite ? '❤️' : '🤍'}
        </button>
    );
};

export default FavoriteButton;
