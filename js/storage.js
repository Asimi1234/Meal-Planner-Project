/* ========================================
   STORAGE MODULE - LocalStorage Management
======================================== */

const STORAGE_KEYS = {
    FAVORITES: 'mealplanner_favorites',
    MEAL_PLAN: 'mealplanner_meal_plan',
    SHOPPING_LIST: 'mealplanner_shopping_list',
    USER_PREFERENCES: 'mealplanner_preferences',
    RECENT_SEARCHES: 'mealplanner_recent_searches'
};

/* ========================================
   GENERIC STORAGE FUNCTIONS
======================================== */

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @returns {any|null} - Retrieved data or null
 */
function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

/**
 * Clear all app data from localStorage
 */
function clearAllStorage() {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}

/* ========================================
   FAVORITES MANAGEMENT
======================================== */

/**
 * Get all favorite recipes
 * @returns {Array} - Array of favorite recipes
 */
function getFavorites() {
    return getFromStorage(STORAGE_KEYS.FAVORITES) || [];
}

/**
 * Add recipe to favorites
 * @param {object} recipe - Recipe object
 */
function addToFavorites(recipe) {
    const favorites = getFavorites();
    
    // Check if already exists
    const exists = favorites.some(fav => fav.id === recipe.id);
    if (exists) {
        console.log('Recipe already in favorites');
        return false;
    }
    
    // Add recipe with timestamp
    favorites.push({
        ...recipe,
        addedAt: Date.now()
    });
    
    saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
    return true;
}

/**
 * Remove recipe from favorites
 * @param {number} recipeId - Recipe ID
 */
function removeFromFavorites(recipeId) {
    const favorites = getFavorites();
    const filtered = favorites.filter(fav => fav.id !== recipeId);
    saveToStorage(STORAGE_KEYS.FAVORITES, filtered);
}

/**
 * Check if recipe is in favorites
 * @param {number} recipeId - Recipe ID
 * @returns {boolean}
 */
function isInFavorites(recipeId) {
    const favorites = getFavorites();
    return favorites.some(fav => fav.id === recipeId);
}

/**
 * Clear all favorites
 */
function clearFavorites() {
    saveToStorage(STORAGE_KEYS.FAVORITES, []);
}

/* ========================================
   MEAL PLAN MANAGEMENT
======================================== */

/**
 * Get current meal plan
 * @returns {object} - Meal plan object
 */
function getMealPlan() {
    return getFromStorage(STORAGE_KEYS.MEAL_PLAN) || {
        monday: { breakfast: null, lunch: null, dinner: null },
        tuesday: { breakfast: null, lunch: null, dinner: null },
        wednesday: { breakfast: null, lunch: null, dinner: null },
        thursday: { breakfast: null, lunch: null, dinner: null },
        friday: { breakfast: null, lunch: null, dinner: null },
        saturday: { breakfast: null, lunch: null, dinner: null },
        sunday: { breakfast: null, lunch: null, dinner: null }
    };
}

/**
 * Add meal to plan
 * @param {string} day - Day of week (lowercase)
 * @param {string} mealType - breakfast, lunch, or dinner
 * @param {object} recipe - Recipe object
 */
function addMealToPlan(day, mealType, recipe) {
    const mealPlan = getMealPlan();
    
    if (!mealPlan[day]) {
        console.error('Invalid day:', day);
        return false;
    }
    
    mealPlan[day][mealType] = recipe;
    saveToStorage(STORAGE_KEYS.MEAL_PLAN, mealPlan);
    return true;
}

/**
 * Remove meal from plan
 * @param {string} day - Day of week
 * @param {string} mealType - breakfast, lunch, or dinner
 */
function removeMealFromPlan(day, mealType) {
    const mealPlan = getMealPlan();
    
    if (mealPlan[day]) {
        mealPlan[day][mealType] = null;
        saveToStorage(STORAGE_KEYS.MEAL_PLAN, mealPlan);
        return true;
    }
    return false;
}

/**
 * Clear entire meal plan
 */
function clearMealPlan() {
    const emptyPlan = {
        monday: { breakfast: null, lunch: null, dinner: null },
        tuesday: { breakfast: null, lunch: null, dinner: null },
        wednesday: { breakfast: null, lunch: null, dinner: null },
        thursday: { breakfast: null, lunch: null, dinner: null },
        friday: { breakfast: null, lunch: null, dinner: null },
        saturday: { breakfast: null, lunch: null, dinner: null },
        sunday: { breakfast: null, lunch: null, dinner: null }
    };
    saveToStorage(STORAGE_KEYS.MEAL_PLAN, emptyPlan);
}

/**
 * Get all meals from plan as array
 * @returns {Array} - Array of all meals
 */
function getAllMealsFromPlan() {
    const mealPlan = getMealPlan();
    const meals = [];
    
    Object.keys(mealPlan).forEach(day => {
        Object.keys(mealPlan[day]).forEach(mealType => {
            const meal = mealPlan[day][mealType];
            if (meal) {
                meals.push({
                    day,
                    mealType,
                    recipe: meal
                });
            }
        });
    });
    
    return meals;
}

/* ========================================
   SHOPPING LIST MANAGEMENT
======================================== */

/**
 * Get shopping list
 * @returns {Array} - Array of shopping items
 */
function getShoppingList() {
    return getFromStorage(STORAGE_KEYS.SHOPPING_LIST) || [];
}

/**
 * Add item to shopping list
 * @param {object} item - Item object {name, category, checked}
 */
function addToShoppingList(item) {
    const list = getShoppingList();
    
    // Check if item already exists
    const exists = list.some(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (exists) {
        console.log('Item already in shopping list');
        return false;
    }
    
    list.push({
        id: Date.now(),
        name: item.name,
        category: item.category || 'other',
        checked: false,
        addedAt: Date.now()
    });
    
    saveToStorage(STORAGE_KEYS.SHOPPING_LIST, list);
    return true;
}

/**
 * Remove item from shopping list
 * @param {number} itemId - Item ID
 */
function removeFromShoppingList(itemId) {
    const list = getShoppingList();
    const filtered = list.filter(item => item.id !== itemId);
    saveToStorage(STORAGE_KEYS.SHOPPING_LIST, filtered);
}

/**
 * Toggle item checked status
 * @param {number} itemId - Item ID
 */
function toggleShoppingItem(itemId) {
    const list = getShoppingList();
    const item = list.find(i => i.id === itemId);
    
    if (item) {
        item.checked = !item.checked;
        saveToStorage(STORAGE_KEYS.SHOPPING_LIST, list);
        return true;
    }
    return false;
}

/**
 * Clear shopping list
 */
function clearShoppingList() {
    saveToStorage(STORAGE_KEYS.SHOPPING_LIST, []);
}

/**
 * Generate shopping list from meal plan
 * @returns {Array} - Generated shopping list
 */
function generateShoppingListFromMealPlan() {
    const meals = getAllMealsFromPlan();
    const ingredients = new Map();
    
    meals.forEach(({ recipe }) => {
        if (recipe && recipe.extendedIngredients) {
            recipe.extendedIngredients.forEach(ingredient => {
                const name = ingredient.name;
                const category = categorizeIngredient(ingredient.aisle || ingredient.name);
                
                if (ingredients.has(name)) {
                    // Ingredient exists, could add quantities here
                    const existing = ingredients.get(name);
                    existing.amount += ingredient.amount || 0;
                } else {
                    ingredients.set(name, {
                        name: name,
                        category: category,
                        amount: ingredient.amount || 0,
                        unit: ingredient.unit || '',
                        checked: false
                    });
                }
            });
        }
    });
    
    return Array.from(ingredients.values());
}

/**
 * Categorize ingredient by name/aisle
 * @param {string} aisle - Aisle or ingredient name
 * @returns {string} - Category
 */
function categorizeIngredient(aisle) {
    const aisleStr = (aisle || '').toLowerCase();
    
    // Produce
    if (aisleStr.match(/produce|vegetable|fruit|lettuce|tomato|onion|pepper|carrot|broccoli|spinach|kale|cabbage|cucumber|zucchini|potato|celery|avocado|mushroom|garlic|herb|fresh/)) {
        return 'produce';
    }
    
    // Meat & Seafood
    if (aisleStr.match(/meat|seafood|poultry|beef|chicken|pork|fish|salmon|tuna|shrimp|turkey|bacon|ham|steak|ground/)) {
        return 'meat';
    }
    
    // Dairy
    if (aisleStr.match(/dairy|milk|cheese|yogurt|butter|cream|egg|sour cream|cottage cheese|mozzarella|cheddar|parmesan/)) {
        return 'dairy';
    }
    
    // Grains & Bread
    if (aisleStr.match(/bread|bakery|grain|pasta|rice|cereal|flour|oat|quinoa|tortilla|bagel|bun|roll|noodle|spaghetti|penne/)) {
        return 'grains';
    }
    
    // Spices & Condiments
    if (aisleStr.match(/spice|condiment|oil|vinegar|sauce|seasoning|salt|pepper|oregano|basil|cumin|paprika|cinnamon|vanilla|mayo|mustard|ketchup|soy sauce|olive oil/)) {
        return 'spices';
    }
    
    // Pantry/Canned
    if (aisleStr.match(/canned|jar|can|dried|baking|sugar|stock|broth|bean|tomato paste|coconut milk/)) {
        return 'pantry';
    }
    
    return 'other';
}

/* ========================================
   USER PREFERENCES MANAGEMENT
======================================== */

/**
 * Get user preferences
 * @returns {object} - User preferences
 */
function getUserPreferences() {
    return getFromStorage(STORAGE_KEYS.USER_PREFERENCES) || {
        diets: [],
        allergies: [],
        cuisines: [],
        calorieGoal: 2000,
        proteinGoal: 150,
        carbsGoal: 250,
        fatGoal: 65,
        maxCookingTime: '',
        lastUpdated: null
    };
}

/**
 * Save user preferences
 * @param {object} preferences - Preferences object
 */
function saveUserPreferences(preferences) {
    saveToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
}

/**
 * Update specific preference
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 */
function updatePreference(key, value) {
    const prefs = getUserPreferences();
    prefs[key] = value;
    saveUserPreferences(prefs);
}

/* ========================================
   RECENT SEARCHES
======================================== */

/**
 * Get recent searches
 * @returns {Array} - Array of recent searches
 */
function getRecentSearches() {
    return getFromStorage(STORAGE_KEYS.RECENT_SEARCHES) || [];
}

/**
 * Add search to recent searches
 * @param {string} query - Search query
 */
function addRecentSearch(query) {
    if (!query || query.trim() === '') return;
    
    const searches = getRecentSearches();
    
    // Remove if already exists
    const filtered = searches.filter(s => s !== query);
    
    // Add to beginning
    filtered.unshift(query);
    
    // Keep only last 10
    const limited = filtered.slice(0, 10);
    
    saveToStorage(STORAGE_KEYS.RECENT_SEARCHES, limited);
}

/**
 * Clear recent searches
 */
function clearRecentSearches() {
    saveToStorage(STORAGE_KEYS.RECENT_SEARCHES, []);
}

/* ========================================
   EXPORT (make functions available globally)
======================================== */

window.Storage = {
    // Generic
    saveToStorage,
    getFromStorage,
    removeFromStorage,
    clearAllStorage,
    
    // Favorites
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    clearFavorites,
    
    // Meal Plan
    getMealPlan,
    addMealToPlan,
    removeMealFromPlan,
    clearMealPlan,
    getAllMealsFromPlan,
    
    // Shopping List
    getShoppingList,
    addToShoppingList,
    removeFromShoppingList,
    toggleShoppingItem,
    clearShoppingList,
    generateShoppingListFromMealPlan,
    
    // Preferences
    getUserPreferences,
    saveUserPreferences,
    updatePreference,
    
    // Recent Searches
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches
};