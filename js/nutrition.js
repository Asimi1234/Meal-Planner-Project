/* ========================================
   NUTRITION DASHBOARD MODULE
======================================== */

let currentView = 'today'; // today, week, month

/**
 * Initialize nutrition dashboard
 */
function initNutritionDashboard() {
    console.log('📊 Initializing Nutrition Dashboard');
    
    loadNutritionData('today');
    initViewToggle();
    initExportButton();
}

/**
 * Initialize view toggle buttons
 */
function initViewToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            toggleBtns.forEach(b => b.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            
            // Get view type
            const view = btn.dataset.view;
            currentView = view;
            
            // Load data for that view
            loadNutritionData(view);
        });
    });
}

/**
 * Load nutrition data based on view
 * @param {string} view - 'today', 'week', or 'month'
 */
function loadNutritionData(view) {
    const viewTitle = document.getElementById('viewTitle');
    
    switch(view) {
        case 'today':
            if (viewTitle) viewTitle.textContent = "Today's Nutrition";
            loadTodayNutrition();
            break;
        case 'week':
            if (viewTitle) viewTitle.textContent = "This Week's Nutrition";
            loadWeekNutrition();
            break;
        case 'month':
            if (viewTitle) viewTitle.textContent = "This Month's Nutrition";
            loadMonthNutrition();
            break;
    }
}

/**
 * Load today's nutrition from meal plan
 */
function loadTodayNutrition() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
    const mealPlan = Storage.getMealPlan();
    const todaysMeals = mealPlan[today] || { breakfast: null, lunch: null, dinner: null };
    const preferences = Storage.getUserPreferences();
    
    // Goals from preferences
    const calorieGoal = preferences.calorieGoal || 2000;
    const proteinGoal = preferences.proteinGoal || 150;
    const carbsGoal = preferences.carbsGoal || 250;
    const fatGoal = preferences.fatGoal || 65;
    
    // Calculate totals from meals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    const mealNutrition = {
        breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        lunch: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        dinner: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    };
    
    // Process each meal
    Object.keys(todaysMeals).forEach(mealType => {
        const meal = todaysMeals[mealType];
        if (meal && meal.nutrition) {
            const nutrition = extractNutritionFromRecipe(meal);
            
            mealNutrition[mealType] = nutrition;
            
            totalCalories += nutrition.calories;
            totalProtein += nutrition.protein;
            totalCarbs += nutrition.carbs;
            totalFat += nutrition.fat;
        }
    });
    
    // Update main stats
    updateMainStats(totalCalories, totalProtein, totalCarbs, totalFat, calorieGoal, proteinGoal, carbsGoal, fatGoal);
    
    // Update meal breakdown
    updateMealBreakdown(mealNutrition);
    
    // Update weekly chart
    updateWeeklyChart();
}

/**
 * Extract nutrition from recipe object
 * @param {object} recipe - Recipe object
 * @returns {object} - Nutrition values
 */
function extractNutritionFromRecipe(recipe) {
    const nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    if (recipe.nutrition && recipe.nutrition.nutrients) {
        const nutrients = recipe.nutrition.nutrients;
        
        const caloriesNutrient = nutrients.find(n => n.name === 'Calories');
        const proteinNutrient = nutrients.find(n => n.name === 'Protein');
        const carbsNutrient = nutrients.find(n => n.name === 'Carbohydrates');
        const fatNutrient = nutrients.find(n => n.name === 'Fat');
        
        nutrition.calories = caloriesNutrient ? Math.round(caloriesNutrient.amount) : 0;
        nutrition.protein = proteinNutrient ? Math.round(proteinNutrient.amount) : 0;
        nutrition.carbs = carbsNutrient ? Math.round(carbsNutrient.amount) : 0;
        nutrition.fat = fatNutrient ? Math.round(fatNutrient.amount) : 0;
    }
    
    return nutrition;
}

/**
 * Update main statistics display
 */
function updateMainStats(calories, protein, carbs, fat, calorieGoal, proteinGoal, carbsGoal, fatGoal) {
    // Update values
    const caloriesConsumed = document.getElementById('caloriesConsumed');
    const caloriesGoalEl = document.getElementById('caloriesGoal');
    const caloriesRemaining = document.getElementById('caloriesRemaining');
    const caloriesProgress = document.getElementById('caloriesProgress');
    
    if (caloriesConsumed) caloriesConsumed.textContent = calories;
    if (caloriesGoalEl) caloriesGoalEl.textContent = calorieGoal;
    if (caloriesRemaining) {
        const remaining = calorieGoal - calories;
        caloriesRemaining.textContent = remaining > 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`;
        caloriesRemaining.style.color = remaining > 0 ? '#4CAF50' : '#E53935';
    }
    if (caloriesProgress) {
        const percentage = Math.min((calories / calorieGoal) * 100, 100);
        caloriesProgress.style.width = `${percentage}%`;
    }
    
    // Protein
    const proteinConsumed = document.getElementById('proteinConsumed');
    const proteinGoalEl = document.getElementById('proteinGoal');
    const proteinRemaining = document.getElementById('proteinRemaining');
    const proteinProgress = document.getElementById('proteinProgress');
    
    if (proteinConsumed) proteinConsumed.textContent = protein;
    if (proteinGoalEl) proteinGoalEl.textContent = proteinGoal;
    if (proteinRemaining) {
        const remaining = proteinGoal - protein;
        proteinRemaining.textContent = remaining > 0 ? `${remaining}g remaining` : `${Math.abs(remaining)}g over`;
        proteinRemaining.style.color = remaining > 0 ? '#4CAF50' : '#E53935';
    }
    if (proteinProgress) {
        const percentage = Math.min((protein / proteinGoal) * 100, 100);
        proteinProgress.style.width = `${percentage}%`;
    }
    
    // Carbs
    const carbsConsumed = document.getElementById('carbsConsumed');
    const carbsGoalEl = document.getElementById('carbsGoal');
    const carbsRemaining = document.getElementById('carbsRemaining');
    const carbsProgress = document.getElementById('carbsProgress');
    
    if (carbsConsumed) carbsConsumed.textContent = carbs;
    if (carbsGoalEl) carbsGoalEl.textContent = carbsGoal;
    if (carbsRemaining) {
        const remaining = carbsGoal - carbs;
        carbsRemaining.textContent = remaining > 0 ? `${remaining}g remaining` : `${Math.abs(remaining)}g over`;
        carbsRemaining.style.color = remaining > 0 ? '#4CAF50' : '#E53935';
    }
    if (carbsProgress) {
        const percentage = Math.min((carbs / carbsGoal) * 100, 100);
        carbsProgress.style.width = `${percentage}%`;
    }
    
    // Fat
    const fatConsumed = document.getElementById('fatConsumed');
    const fatGoalEl = document.getElementById('fatGoal');
    const fatRemaining = document.getElementById('fatRemaining');
    const fatProgress = document.getElementById('fatProgress');
    
    if (fatConsumed) fatConsumed.textContent = fat;
    if (fatGoalEl) fatGoalEl.textContent = fatGoal;
    if (fatRemaining) {
        const remaining = fatGoal - fat;
        fatRemaining.textContent = remaining > 0 ? `${remaining}g remaining` : `${Math.abs(remaining)}g over`;
        fatRemaining.style.color = remaining > 0 ? '#4CAF50' : '#E53935';
    }
    if (fatProgress) {
        const percentage = Math.min((fat / fatGoal) * 100, 100);
        fatProgress.style.width = `${percentage}%`;
    }
}

/**
 * Update meal breakdown section
 */
function updateMealBreakdown(mealNutrition) {
    // Breakfast
    const breakfastCalories = document.getElementById('breakfastCalories');
    const breakfastProtein = document.getElementById('breakfastProtein');
    const breakfastCarbs = document.getElementById('breakfastCarbs');
    const breakfastFat = document.getElementById('breakfastFat');
    
    if (breakfastCalories) breakfastCalories.textContent = mealNutrition.breakfast.calories;
    if (breakfastProtein) breakfastProtein.textContent = `${mealNutrition.breakfast.protein}g`;
    if (breakfastCarbs) breakfastCarbs.textContent = `${mealNutrition.breakfast.carbs}g`;
    if (breakfastFat) breakfastFat.textContent = `${mealNutrition.breakfast.fat}g`;
    
    // Lunch
    const lunchCalories = document.getElementById('lunchCalories');
    const lunchProtein = document.getElementById('lunchProtein');
    const lunchCarbs = document.getElementById('lunchCarbs');
    const lunchFat = document.getElementById('lunchFat');
    
    if (lunchCalories) lunchCalories.textContent = mealNutrition.lunch.calories;
    if (lunchProtein) lunchProtein.textContent = `${mealNutrition.lunch.protein}g`;
    if (lunchCarbs) lunchCarbs.textContent = `${mealNutrition.lunch.carbs}g`;
    if (lunchFat) lunchFat.textContent = `${mealNutrition.lunch.fat}g`;
    
    // Dinner
    const dinnerCalories = document.getElementById('dinnerCalories');
    const dinnerProtein = document.getElementById('dinnerProtein');
    const dinnerCarbs = document.getElementById('dinnerCarbs');
    const dinnerFat = document.getElementById('dinnerFat');
    
    if (dinnerCalories) dinnerCalories.textContent = mealNutrition.dinner.calories;
    if (dinnerProtein) dinnerProtein.textContent = `${mealNutrition.dinner.protein}g`;
    if (dinnerCarbs) dinnerCarbs.textContent = `${mealNutrition.dinner.carbs}g`;
    if (dinnerFat) dinnerFat.textContent = `${mealNutrition.dinner.fat}g`;
}

/**
 * Load weekly nutrition
 */
function loadWeekNutrition() {
    const mealPlan = Storage.getMealPlan();
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    let weeklyCalories = 0;
    let weeklyProtein = 0;
    let weeklyCarbs = 0;
    let weeklyFat = 0;
    
    days.forEach(day => {
        const dayMeals = mealPlan[day];
        if (dayMeals) {
            Object.values(dayMeals).forEach(meal => {
                if (meal) {
                    const nutrition = extractNutritionFromRecipe(meal);
                    weeklyCalories += nutrition.calories;
                    weeklyProtein += nutrition.protein;
                    weeklyCarbs += nutrition.carbs;
                    weeklyFat += nutrition.fat;
                }
            });
        }
    });
    
    // Calculate daily average
    const avgCalories = Math.round(weeklyCalories / 7);
    const avgProtein = Math.round(weeklyProtein / 7);
    const avgCarbs = Math.round(weeklyCarbs / 7);
    const avgFat = Math.round(weeklyFat / 7);
    
    const preferences = Storage.getUserPreferences();
    updateMainStats(avgCalories, avgProtein, avgCarbs, avgFat, 
        preferences.calorieGoal, preferences.proteinGoal, preferences.carbsGoal, preferences.fatGoal);
    
    updateWeeklyChart();
}

/**
 * Load monthly nutrition (simplified - shows weekly average)
 */
function loadMonthNutrition() {
    // For simplicity, just show weekly data multiplied
    loadWeekNutrition();
}

/**
 * Update weekly chart (simple CSS bar chart)
 */
function updateWeeklyChart() {
    const chartContainer = document.getElementById('weeklyChart');
    if (!chartContainer) return;
    
    const mealPlan = Storage.getMealPlan();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const dayCalories = dayKeys.map(dayKey => {
        const dayMeals = mealPlan[dayKey];
        let total = 0;
        if (dayMeals) {
            Object.values(dayMeals).forEach(meal => {
                if (meal) {
                    const nutrition = extractNutritionFromRecipe(meal);
                    total += nutrition.calories;
                }
            });
        }
        return total;
    });
    
    const maxCalories = Math.max(...dayCalories, 2000);
    
    chartContainer.innerHTML = days.map((day, index) => {
        const calories = dayCalories[index];
        const percentage = (calories / maxCalories) * 100;
        
        return `
            <div class="chart-bar">
                <div class="bar-fill" style="height: ${percentage}%">
                    <span class="bar-value">${calories}</span>
                </div>
                <span class="bar-label">${day}</span>
            </div>
        `;
    }).join('');
}

/**
 * Initialize export button
 */
function initExportButton() {
    const exportBtn = document.getElementById('exportNutrition');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportNutritionData);
    }
}

/**
 * Export nutrition data as JSON
 */
function exportNutritionData() {
    const mealPlan = Storage.getMealPlan();
    const preferences = Storage.getUserPreferences();
    
    const data = {
        mealPlan: mealPlan,
        preferences: preferences,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrition-data-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    Utils.showToast('Nutrition data exported!', 'success');
}

/* ========================================
   EXPORT
======================================== */

window.Nutrition = {
    initNutritionDashboard,
    loadNutritionData,
    exportNutritionData
};