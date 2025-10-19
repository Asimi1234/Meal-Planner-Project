/* ========================================
   API MODULE - Spoonacular API Integration
======================================== */

console.log('🔧 Loading API module...');

// API key loaded from config.js
const API_KEY = CONFIG.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

console.log('API Key configured:', API_KEY ? 'Yes ✅' : 'No ❌');

/* ========================================
   API REQUEST FUNCTIONS
======================================== */

/**
 * Fetch data from API with error handling
 * @param {string} url - API endpoint URL
 * @returns {Promise} - Response data or error
 */
async function fetchFromAPI(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return { success: true, data };
        
    } catch (error) {
        console.error('API Fetch Error:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to fetch data from API' 
        };
    }
}

/**
 * Search for recipes
 * @param {string} query - Search query
 * @param {object} filters - Filter options
 * @returns {Promise} - Array of recipes
 */
async function searchRecipes(query = '', filters = {}) {
    const params = new URLSearchParams({
        apiKey: API_KEY,
        query: query || '',
        number: 12,
        addRecipeInformation: true,
        fillIngredients: true,
        ...filters
    });
    
    const url = `${BASE_URL}/recipes/complexSearch?${params}`;
    const result = await fetchFromAPI(url);
    
    if (result.success) {
        return result.data.results || [];
    }
    return [];
}

/**
 * Get detailed information about a recipe
 * @param {number} recipeId - Recipe ID
 * @returns {Promise} - Recipe details object
 */
async function getRecipeById(recipeId) {
    const url = `${BASE_URL}/recipes/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=true`;
    const result = await fetchFromAPI(url);
    
    if (result.success) {
        return result.data;
    }
    return null;
}

/**
 * Get similar recipes
 * @param {number} recipeId - Recipe ID
 * @returns {Promise} - Array of similar recipes
 */
async function getSimilarRecipes(recipeId) {
    const url = `${BASE_URL}/recipes/${recipeId}/similar?apiKey=${API_KEY}&number=4`;
    const result = await fetchFromAPI(url);
    
    if (result.success) {
        return result.data || [];
    }
    return [];
}

/**
 * Get random recipes
 * @param {number} count - Number of recipes
 * @param {string} tags - Tags for filtering
 * @returns {Promise} - Array of random recipes
 */
async function getRandomRecipes(count = 6, tags = '') {
    const params = new URLSearchParams({
        apiKey: API_KEY,
        number: count,
        tags: tags
    });
    
    const url = `${BASE_URL}/recipes/random?${params}`;
    const result = await fetchFromAPI(url);
    
    if (result.success) {
        return result.data.recipes || [];
    }
    return [];
}

/**
 * Check if API key is configured
 * @returns {boolean}
 */
function isAPIKeyConfigured() {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || API_KEY === '' || API_KEY.length < 10) {
        console.error('⚠️ Spoonacular API key not configured properly!');
        return false;
    }
    return true;
}

/**
 * Cache API responses
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} expiryMinutes - Expiry time
 */
function cacheAPIResponse(key, data, expiryMinutes = 60) {
    const cacheData = {
        data: data,
        timestamp: Date.now(),
        expiry: expiryMinutes * 60 * 1000
    };
    localStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheData));
}

/**
 * Get cached API response
 * @param {string} key - Cache key
 * @returns {any|null}
 */
function getCachedAPIResponse(key) {
    const cached = localStorage.getItem(`api_cache_${key}`);
    if (!cached) return null;
    
    try {
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        
        if (now - cacheData.timestamp < cacheData.expiry) {
            return cacheData.data;
        } else {
            localStorage.removeItem(`api_cache_${key}`);
            return null;
        }
    } catch (error) {
        console.error('Cache parse error:', error);
        return null;
    }
}

/**
 * Search recipes with caching
 * @param {string} query - Search query
 * @param {object} filters - Filters
 * @returns {Promise}
 */
async function searchRecipesWithCache(query = '', filters = {}) {
    const cacheKey = `search_${query}_${JSON.stringify(filters)}`;
    
    const cached = getCachedAPIResponse(cacheKey);
    if (cached) {
        console.log('📦 Using cached results');
        return cached;
    }
    
    const results = await searchRecipes(query, filters);
    
    if (results.length > 0) {
        cacheAPIResponse(cacheKey, results, 30);
    }
    
    return results;
}

/* ========================================
   EXPORT
======================================== */

window.API = {
    searchRecipes,
    getRecipeById,
    getSimilarRecipes,
    getRandomRecipes,
    isAPIKeyConfigured,
    searchRecipesWithCache,
    cacheAPIResponse,
    getCachedAPIResponse,
    fetchFromAPI
};

console.log('✅ API module loaded successfully!', window.API);