/* ========================================
   RECIPE MODULE - Recipe Display & Management
======================================== */

/**
 * Display recipes in a grid
 * @param {Array} recipes - Array of recipe objects
 * @param {HTMLElement} container - Container element
 */
function displayRecipes(recipes, container) {
    if (!container) return;
    
    if (!recipes || recipes.length === 0) {
        Utils.showEmptyState(container, 'No recipes found. Try a different search.');
        return;
    }
    
    container.innerHTML = '';
    
    recipes.forEach((recipe, index) => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card fade-in';
        recipeCard.style.animationDelay = `${index * 0.1}s`;
        recipeCard.innerHTML = createRecipeCard(recipe);
        container.appendChild(recipeCard);
    });
    
    // Add event listeners to cards
    attachRecipeCardListeners(container);
}

/**
 * Create recipe card HTML
 * @param {object} recipe - Recipe object
 * @returns {string} - HTML string
 */
function createRecipeCard(recipe) {
    const image = recipe.image || Utils.getPlaceholderImage();
    const title = recipe.title || 'Untitled Recipe';
    const time = Utils.formatTime(recipe.readyInMinutes);
    const servings = recipe.servings || 'N/A';
    const isFavorite = Storage.isInFavorites(recipe.id);
    
    return `
        <img src="${image}" alt="${title}" class="recipe-card-image" loading="lazy">
        <div class="recipe-card-content">
            <h4 class="recipe-card-title">${Utils.truncateText(title, 60)}</h4>
            <div class="recipe-card-meta">
                <span>⏱️ ${time}</span>
                <span>👥 ${servings} servings</span>
            </div>
            <div class="recipe-card-actions">
                <button class="icon-btn view-recipe-btn" data-id="${recipe.id}" title="View Recipe">
                    👁️ View
                </button>
                <button class="icon-btn add-to-plan-btn" data-id="${recipe.id}" title="Add to Meal Plan">
                    📅 Plan
                </button>
                <button class="icon-btn favorite-btn ${isFavorite ? 'active' : ''}" data-id="${recipe.id}" title="Favorite">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
            </div>
        </div>
    `;
}

/**
 * Attach event listeners to recipe cards
 * @param {HTMLElement} container - Container with recipe cards
 */
function attachRecipeCardListeners(container) {
    // View recipe buttons
    container.querySelectorAll('.view-recipe-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const recipeId = e.target.dataset.id;
            viewRecipeDetail(recipeId);
        });
    });
    
    // Add to meal plan buttons
    container.querySelectorAll('.add-to-plan-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const recipeId = parseInt(e.target.dataset.id);
            await handleAddToPlan(recipeId);
        });
    });
    
    // Favorite buttons
    container.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const recipeId = parseInt(e.target.dataset.id);
            await toggleFavorite(recipeId, e.target);
        });
    });
    
    // Make entire card clickable
    container.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('icon-btn') && 
                !e.target.classList.contains('favorite-btn') &&
                !e.target.classList.contains('add-to-plan-btn')) {
                const btn = card.querySelector('.view-recipe-btn');
                if (btn) {
                    const recipeId = btn.dataset.id;
                    viewRecipeDetail(recipeId);
                }
            }
        });
    });
}

/**
 * Navigate to recipe detail page
 * @param {number} recipeId - Recipe ID
 */
function viewRecipeDetail(recipeId) {
    window.location.href = `recipe-detail.html?id=${recipeId}`;
}

/**
 * Toggle favorite status
 * @param {number} recipeId - Recipe ID
 * @param {HTMLElement} button - Favorite button
 */
async function toggleFavorite(recipeId, button) {
    const isCurrentlyFavorite = Storage.isInFavorites(recipeId);
    
    if (isCurrentlyFavorite) {
        // Remove from favorites
        Storage.removeFromFavorites(recipeId);
        button.textContent = '🤍';
        button.classList.remove('active');
        Utils.showToast('Removed from favorites', 'info');
    } else {
        // Add to favorites - need to fetch recipe details
        Utils.showLoading(button);
        const recipe = await API.getRecipeById(recipeId);
        
        if (recipe) {
            Storage.addToFavorites(recipe);
            button.textContent = '❤️';
            button.classList.add('active');
            Utils.animateElement(button, 'heart-animation');
            Utils.showToast('Added to favorites!', 'success');
        } else {
            button.textContent = '🤍';
            Utils.showToast('Failed to add to favorites', 'error');
        }
    }
}

/**
 * Load and display recipe details
 * @param {number} recipeId - Recipe ID
 */
async function loadRecipeDetails(recipeId) {
    if (!API.isAPIKeyConfigured()) {
        Utils.showError(
            document.querySelector('.recipe-content'),
            'API key not configured. Please add your Spoonacular API key.'
        );
        return;
    }
    
    // Show loading states
    Utils.showLoading(document.querySelector('.recipe-hero-content'));
    
    try {
        const recipe = await API.getRecipeById(recipeId);
        
        if (!recipe) {
            Utils.showError(
                document.querySelector('.recipe-content'),
                'Recipe not found'
            );
            return;
        }
        
        displayRecipeDetails(recipe);
        loadSimilarRecipes(recipeId);
        
    } catch (error) {
        console.error('Error loading recipe:', error);
        Utils.showError(
            document.querySelector('.recipe-content'),
            'Failed to load recipe details'
        );
    }
}

/**
 * Display recipe details on page
 * @param {object} recipe - Recipe object
 */
function displayRecipeDetails(recipe) {
    // Update image and title
    const recipeImage = document.getElementById('recipeImage');
    const recipeTitle = document.getElementById('recipeTitle');
    
    if (recipeImage) {
        recipeImage.src = recipe.image || Utils.getPlaceholderImage(600, 400);
        recipeImage.alt = recipe.title;
    }
    if (recipeTitle) {
        recipeTitle.textContent = recipe.title;
    }
    
    // Update meta information
    const recipeTime = document.getElementById('recipeTime');
    const recipeServings = document.getElementById('recipeServings');
    const recipeRating = document.getElementById('recipeRating');
    
    if (recipeTime) {
        recipeTime.textContent = Utils.formatTime(recipe.readyInMinutes);
    }
    if (recipeServings) {
        recipeServings.textContent = `${recipe.servings} servings`;
    }
    if (recipeRating) {
        recipeRating.textContent = recipe.spoonacularScore 
            ? (recipe.spoonacularScore / 20).toFixed(1) 
            : 'N/A';
    }
    
    // Update summary
    const recipeSummary = document.getElementById('recipeSummary');
    if (recipeSummary) {
        const summary = Utils.stripHTML(recipe.summary);
        recipeSummary.textContent = summary;
    }
    
    // Display ingredients
    displayIngredients(recipe.extendedIngredients || []);
    
    // Display nutrition
    displayNutrition(recipe.nutrition);
    
    // Display instructions
    displayInstructions(recipe.analyzedInstructions || []);
    
    // Display diet labels
    displayDietLabels(recipe);
    
    // Update favorite button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        const isFavorite = Storage.isInFavorites(recipe.id);
        saveBtn.innerHTML = isFavorite ? '<span>❤️</span> Saved' : '<span>❤️</span> Save to Favorites';
        saveBtn.onclick = () => toggleFavoriteDetail(recipe, saveBtn);
    }
}

/**
 * Display ingredients list
 * @param {Array} ingredients - Array of ingredients
 */
function displayIngredients(ingredients) {
    const list = document.getElementById('ingredientsList');
    
    if (!list) return;
    
    if (!ingredients || ingredients.length === 0) {
        list.innerHTML = '<li>No ingredients available</li>';
        return;
    }
    
    list.innerHTML = ingredients.map(ing => `
        <li>${Utils.formatIngredient(ing)}</li>
    `).join('');
}

/**
 * Display nutrition information
 * @param {object} nutrition - Nutrition object
 */
function displayNutrition(nutrition) {
    if (!nutrition || !nutrition.nutrients) {
        return;
    }
    
    const nutrients = nutrition.nutrients;
    
    const calories = nutrients.find(n => n.name === 'Calories');
    const protein = nutrients.find(n => n.name === 'Protein');
    const carbs = nutrients.find(n => n.name === 'Carbohydrates');
    const fat = nutrients.find(n => n.name === 'Fat');
    
    const caloriesEl = document.getElementById('nutritionCalories');
    const proteinEl = document.getElementById('nutritionProtein');
    const carbsEl = document.getElementById('nutritionCarbs');
    const fatEl = document.getElementById('nutritionFat');
    
    if (caloriesEl) caloriesEl.textContent = calories ? Math.round(calories.amount) : '0';
    if (proteinEl) proteinEl.textContent = protein ? Utils.formatNutrition(protein.amount) : '0g';
    if (carbsEl) carbsEl.textContent = carbs ? Utils.formatNutrition(carbs.amount) : '0g';
    if (fatEl) fatEl.textContent = fat ? Utils.formatNutrition(fat.amount) : '0g';
}

/**
 * Display cooking instructions
 * @param {Array} instructions - Array of instruction sets
 */
function displayInstructions(instructions) {
    const list = document.getElementById('instructionsList');
    
    if (!list) return;
    
    if (!instructions || instructions.length === 0 || !instructions[0].steps) {
        list.innerHTML = '<li>No instructions available</li>';
        return;
    }
    
    const steps = instructions[0].steps;
    list.innerHTML = steps.map(step => `
        <li>${step.step}</li>
    `).join('');
}

/**
 * Display diet labels/badges
 * @param {object} recipe - Recipe object
 */
function displayDietLabels(recipe) {
    const container = document.getElementById('dietLabels');
    
    if (!container) return;
    
    const labels = [];
    
    if (recipe.vegetarian) labels.push('Vegetarian');
    if (recipe.vegan) labels.push('Vegan');
    if (recipe.glutenFree) labels.push('Gluten Free');
    if (recipe.dairyFree) labels.push('Dairy Free');
    if (recipe.veryHealthy) labels.push('Very Healthy');
    
    if (labels.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.innerHTML = labels.map(label => `
        <span class="diet-badge">${label}</span>
    `).join('');
}

/**
 * Toggle favorite on detail page
 * @param {object} recipe - Recipe object
 * @param {HTMLElement} button - Save button
 */
function toggleFavoriteDetail(recipe, button) {
    const isFavorite = Storage.isInFavorites(recipe.id);
    
    if (isFavorite) {
        Storage.removeFromFavorites(recipe.id);
        button.innerHTML = '<span>❤️</span> Save to Favorites';
        Utils.showToast('Removed from favorites', 'info');
    } else {
        Storage.addToFavorites(recipe);
        button.innerHTML = '<span>❤️</span> Saved';
        Utils.animateElement(button, 'pulse');
        Utils.showToast('Added to favorites!', 'success');
    }
}

/**
 * Load similar recipes
 * @param {number} recipeId - Recipe ID
 */
async function loadSimilarRecipes(recipeId) {
    const container = document.getElementById('similarRecipes');
    
    try {
        const similar = await API.getSimilarRecipes(recipeId);
        
        if (!similar || similar.length === 0) {
            container.innerHTML = '<p class="loading-message">No similar recipes found</p>';
            return;
        }
        
        // Get full details for similar recipes
        const detailedRecipes = await Promise.all(
            similar.slice(0, 4).map(r => API.getRecipeById(r.id))
        );
        
        displayRecipes(detailedRecipes.filter(r => r !== null), container);
        
    } catch (error) {
        console.error('Error loading similar recipes:', error);
        container.innerHTML = '<p class="loading-message">Failed to load similar recipes</p>';
    }
}

/**
 * Add recipe ingredients to shopping list
 * @param {number} recipeId - Recipe ID
 */
async function addIngredientsToShoppingList(recipeId) {
    const recipe = await API.getRecipeById(recipeId);
    
    if (!recipe || !recipe.extendedIngredients) {
        Utils.showToast('Failed to add ingredients', 'error');
        return;
    }
    
    let addedCount = 0;
    
    recipe.extendedIngredients.forEach(ingredient => {
        const item = {
            name: ingredient.name,
            category: Storage.categorizeIngredient(ingredient.aisle || ingredient.name)
        };
        
        if (Storage.addToShoppingList(item)) {
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        Utils.showToast(`Added ${addedCount} ingredients to shopping list!`, 'success');
    } else {
        Utils.showToast('All ingredients already in shopping list', 'info');
    }
}

/**
 * Handle adding recipe to meal plan
 * @param {number} recipeId - Recipe ID
 */
async function handleAddToPlan(recipeId) {
    // Show modal to select day and meal type
    showMealPlanModal(recipeId);
}

/**
 * Show modal for selecting day and meal type
 * @param {number} recipeId - Recipe ID
 */
function showMealPlanModal(recipeId) {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content meal-plan-modal">
            <div class="modal-header">
                <h3>Add to Meal Plan</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="modalDay">Select Day:</label>
                    <select id="modalDay" class="form-select">
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="modalMeal">Select Meal:</label>
                    <select id="modalMeal" class="form-select">
                        <option value="breakfast">🌅 Breakfast</option>
                        <option value="lunch">🌞 Lunch</option>
                        <option value="dinner">🌙 Dinner</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-primary" id="confirmAddToPlan">Add to Plan</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add animation
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Handle confirm button
    const confirmBtn = document.getElementById('confirmAddToPlan');
    confirmBtn.addEventListener('click', async () => {
        const day = document.getElementById('modalDay').value;
        const mealType = document.getElementById('modalMeal').value;
        
        // Show loading
        confirmBtn.innerHTML = '<span class="spinner"></span> Adding...';
        confirmBtn.disabled = true;
        
        // Fetch recipe details
        const recipe = await API.getRecipeById(recipeId);
        
        if (recipe) {
            Storage.addMealToPlan(day, mealType, recipe);
            Utils.showToast(`Added to ${day} ${mealType}!`, 'success');
            modal.remove();
        } else {
            Utils.showToast('Failed to add recipe', 'error');
            confirmBtn.innerHTML = 'Add to Plan';
            confirmBtn.disabled = false;
        }
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

/* ========================================
   EXPORT
======================================== */

window.Recipe = {
    displayRecipes,
    createRecipeCard,
    viewRecipeDetail,
    toggleFavorite,
    loadRecipeDetails,
    displayRecipeDetails,
    addIngredientsToShoppingList,
    handleAddToPlan,
    showMealPlanModal
};