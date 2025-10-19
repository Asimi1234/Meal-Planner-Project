/* ========================================
   FAVORITES PAGE MODULE
======================================== */

/**
 * Initialize favorites page
 */
function initFavoritesPage() {
    console.log('❤️ Initializing Favorites Page');
    
    loadFavorites();
    initFavoritesControls();
}

/**
 * Load and display all favorite recipes
 */
function loadFavorites(sortBy = 'recent') {
    const favoritesGrid = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('emptyFavorites');
    const totalFavoritesElement = document.getElementById('totalFavorites');
    
    if (!favoritesGrid) return;
    
    let favorites = Storage.getFavorites();
    
    // Update total count
    if (totalFavoritesElement) {
        totalFavoritesElement.textContent = favorites.length;
    }
    
    // Show empty state if no favorites
    if (favorites.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        favoritesGrid.style.display = 'none';
        return;
    }
    
    // Hide empty state, show grid
    if (emptyState) emptyState.style.display = 'none';
    favoritesGrid.style.display = 'grid';
    
    // Sort favorites
    favorites = sortFavorites(favorites, sortBy);
    
    // Display favorites
    Recipe.displayRecipes(favorites, favoritesGrid);
    
    // Update button states
    updateFavoriteButtons();
}

/**
 * Sort favorites by different criteria
 * @param {Array} favorites - Array of favorite recipes
 * @param {string} sortBy - Sort criteria
 * @returns {Array} - Sorted array
 */
function sortFavorites(favorites, sortBy) {
    const sorted = [...favorites];
    
    switch(sortBy) {
        case 'recent':
            // Sort by most recently added (newest first)
            sorted.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
            break;
            
        case 'title':
            // Sort alphabetically by title
            sorted.sort((a, b) => {
                const titleA = (a.title || '').toLowerCase();
                const titleB = (b.title || '').toLowerCase();
                return titleA.localeCompare(titleB);
            });
            break;
            
        case 'time':
            // Sort by cooking time (shortest first)
            sorted.sort((a, b) => {
                return (a.readyInMinutes || 999) - (b.readyInMinutes || 999);
            });
            break;
            
        default:
            // Default to recent
            sorted.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    }
    
    return sorted;
}

/**
 * Initialize favorites page controls
 */
function initFavoritesControls() {
    // Sort dropdown
    const sortSelect = document.getElementById('sortFavorites');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            loadFavorites(e.target.value);
        });
    }
    
    // Clear all favorites button
    const clearAllBtn = document.getElementById('clearAllFavorites');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', handleClearAllFavorites);
    }
}

/**
 * Handle clearing all favorites
 */
function handleClearAllFavorites() {
    const favorites = Storage.getFavorites();
    
    if (favorites.length === 0) {
        Utils.showToast('No favorites to clear', 'info');
        return;
    }
    
    const confirmMessage = `Are you sure you want to remove all ${favorites.length} favorite recipes? This cannot be undone.`;
    
    if (confirm(confirmMessage)) {
        Storage.clearFavorites();
        loadFavorites();
        Utils.showToast('All favorites cleared', 'info');
    }
}

/**
 * Update favorite button states (ensure hearts are filled)
 */
function updateFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    favoriteButtons.forEach(btn => {
        const recipeId = parseInt(btn.dataset.id);
        const isFavorite = Storage.isInFavorites(recipeId);
        
        if (isFavorite) {
            btn.textContent = '❤️';
            btn.classList.add('active');
        }
    });
}

/**
 * Remove recipe from favorites (called from recipe cards)
 * @param {number} recipeId - Recipe ID to remove
 */
function removeFavorite(recipeId) {
    Storage.removeFromFavorites(recipeId);
    loadFavorites();
    Utils.showToast('Removed from favorites', 'info');
}

/**
 * Export favorites as JSON (bonus feature)
 */
function exportFavorites() {
    const favorites = Storage.getFavorites();
    
    if (favorites.length === 0) {
        Utils.showToast('No favorites to export', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-favorite-recipes-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    Utils.showToast('Favorites exported!', 'success');
}

/**
 * Import favorites from JSON (bonus feature)
 */
function importFavorites(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const importedFavorites = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedFavorites)) {
                throw new Error('Invalid format');
            }
            
            // Add imported favorites
            importedFavorites.forEach(recipe => {
                Storage.addToFavorites(recipe);
            });
            
            loadFavorites();
            Utils.showToast(`Imported ${importedFavorites.length} recipes!`, 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            Utils.showToast('Failed to import favorites', 'error');
        }
    };
    
    reader.readAsText(file);
}

/**
 * Filter favorites by dietary preference
 * @param {string} diet - Diet type (vegetarian, vegan, etc.)
 */
function filterFavoritesByDiet(diet) {
    const favorites = Storage.getFavorites();
    
    if (!diet || diet === 'all') {
        loadFavorites();
        return;
    }
    
    const filtered = favorites.filter(recipe => {
        switch(diet) {
            case 'vegetarian':
                return recipe.vegetarian === true;
            case 'vegan':
                return recipe.vegan === true;
            case 'glutenFree':
                return recipe.glutenFree === true;
            case 'dairyFree':
                return recipe.dairyFree === true;
            default:
                return true;
        }
    });
    
    const favoritesGrid = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('emptyFavorites');
    
    if (filtered.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'flex';
            emptyState.querySelector('h3').textContent = 'No recipes match this filter';
            emptyState.querySelector('p').textContent = 'Try a different filter or add more recipes';
        }
        if (favoritesGrid) favoritesGrid.style.display = 'none';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        if (favoritesGrid) favoritesGrid.style.display = 'grid';
        Recipe.displayRecipes(filtered, favoritesGrid);
        updateFavoriteButtons();
    }
}

/**
 * Search within favorites
 * @param {string} query - Search query
 */
function searchFavorites(query) {
    const favorites = Storage.getFavorites();
    
    if (!query || query.trim() === '') {
        loadFavorites();
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const filtered = favorites.filter(recipe => {
        const title = (recipe.title || '').toLowerCase();
        const summary = (recipe.summary || '').toLowerCase();
        return title.includes(searchTerm) || summary.includes(searchTerm);
    });
    
    const favoritesGrid = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('emptyFavorites');
    
    if (filtered.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'flex';
            emptyState.querySelector('h3').textContent = 'No results found';
            emptyState.querySelector('p').textContent = `No favorites match "${query}"`;
        }
        if (favoritesGrid) favoritesGrid.style.display = 'none';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        if (favoritesGrid) favoritesGrid.style.display = 'grid';
        Recipe.displayRecipes(filtered, favoritesGrid);
        updateFavoriteButtons();
    }
}

/* ========================================
   EXPORT
======================================== */

window.Favorites = {
    initFavoritesPage,
    loadFavorites,
    removeFavorite,
    exportFavorites,
    importFavorites,
    filterFavoritesByDiet,
    searchFavorites
};