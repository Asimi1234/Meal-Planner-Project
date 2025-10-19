/* ========================================
   PREFERENCES MODULE
======================================== */

/**
 * Initialize preferences page
 */
function initPreferencesPage() {
    console.log('⚙️ Initializing Preferences Page');
    
    loadSavedPreferences();
    initPreferencesForm();
}

/**
 * Load saved preferences and populate form
 */
function loadSavedPreferences() {
    const prefs = Storage.getUserPreferences();
    
    // Load dietary preferences
    if (prefs.diets && Array.isArray(prefs.diets)) {
        prefs.diets.forEach(diet => {
            const checkbox = document.querySelector(`input[name="diet"][value="${diet}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Load allergies
    if (prefs.allergies && Array.isArray(prefs.allergies)) {
        prefs.allergies.forEach(allergy => {
            const checkbox = document.querySelector(`input[name="allergy"][value="${allergy}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Load nutritional goals
    if (prefs.calorieGoal) {
        document.getElementById('calorieGoal').value = prefs.calorieGoal;
    }
    if (prefs.proteinGoal) {
        document.getElementById('proteinGoal').value = prefs.proteinGoal;
    }
    if (prefs.carbsGoal) {
        document.getElementById('carbsGoal').value = prefs.carbsGoal;
    }
    if (prefs.fatGoal) {
        document.getElementById('fatGoal').value = prefs.fatGoal;
    }
    
    // Load cuisine preferences
    if (prefs.cuisines && Array.isArray(prefs.cuisines)) {
        prefs.cuisines.forEach(cuisine => {
            const checkbox = document.querySelector(`input[name="cuisine"][value="${cuisine}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Load cooking time preference
    if (prefs.maxCookingTime) {
        document.getElementById('maxCookingTime').value = prefs.maxCookingTime;
    }
}

/**
 * Initialize preferences form handlers
 */
function initPreferencesForm() {
    const form = document.getElementById('preferencesForm');
    const resetBtn = document.getElementById('resetPreferences');
    
    // Handle form submission
    if (form) {
        form.addEventListener('submit', handleSavePreferences);
    }
    
    // Handle reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', handleResetPreferences);
    }
    
    // Add visual feedback to checkboxes
    document.querySelectorAll('.checkbox-card').forEach(card => {
        card.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            if (checkbox) {
                // Checkbox will toggle automatically, just add animation
                Utils.animateElement(this, 'pulse');
            }
        });
    });
}

/**
 * Handle saving preferences
 * @param {Event} e - Form submit event
 */
function handleSavePreferences(e) {
    e.preventDefault();
    
    // Collect all form data
    const preferences = {
        diets: getCheckedValues('diet'),
        allergies: getCheckedValues('allergy'),
        cuisines: getCheckedValues('cuisine'),
        calorieGoal: parseInt(document.getElementById('calorieGoal').value) || 2000,
        proteinGoal: parseInt(document.getElementById('proteinGoal').value) || 150,
        carbsGoal: parseInt(document.getElementById('carbsGoal').value) || 250,
        fatGoal: parseInt(document.getElementById('fatGoal').value) || 65,
        maxCookingTime: document.getElementById('maxCookingTime').value || '',
        lastUpdated: Date.now()
    };
    
    // Validate
    if (!validatePreferences(preferences)) {
        return;
    }
    
    // Save to storage
    Storage.saveUserPreferences(preferences);
    
    // Show success message
    Utils.showToast('Preferences saved successfully! 🎉', 'success');
    
    // Optional: Redirect to home after 1 second
    setTimeout(() => {
        // window.location.href = 'index.html';
    }, 1000);
}

/**
 * Get all checked values for a checkbox group
 * @param {string} name - Checkbox name attribute
 * @returns {Array} - Array of checked values
 */
function getCheckedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Validate preferences
 * @param {object} prefs - Preferences object
 * @returns {boolean} - True if valid
 */
function validatePreferences(prefs) {
    // Validate calorie goal
    if (prefs.calorieGoal < 1000 || prefs.calorieGoal > 5000) {
        Utils.showToast('Calorie goal must be between 1000-5000', 'error');
        return false;
    }
    
    // Validate protein goal
    if (prefs.proteinGoal < 50 || prefs.proteinGoal > 300) {
        Utils.showToast('Protein goal must be between 50-300g', 'error');
        return false;
    }
    
    // Validate carbs goal
    if (prefs.carbsGoal < 50 || prefs.carbsGoal > 500) {
        Utils.showToast('Carbs goal must be between 50-500g', 'error');
        return false;
    }
    
    // Validate fat goal
    if (prefs.fatGoal < 20 || prefs.fatGoal > 150) {
        Utils.showToast('Fat goal must be between 20-150g', 'error');
        return false;
    }
    
    return true;
}

/**
 * Handle resetting preferences to default
 */
function handleResetPreferences() {
    if (!confirm('Are you sure you want to reset all preferences to default?')) {
        return;
    }
    
    // Default preferences
    const defaultPrefs = {
        diets: [],
        allergies: [],
        cuisines: [],
        calorieGoal: 2000,
        proteinGoal: 150,
        carbsGoal: 250,
        fatGoal: 65,
        maxCookingTime: '',
        lastUpdated: Date.now()
    };
    
    // Save defaults
    Storage.saveUserPreferences(defaultPrefs);
    
    // Clear form
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('calorieGoal').value = '2000';
    document.getElementById('proteinGoal').value = '150';
    document.getElementById('carbsGoal').value = '250';
    document.getElementById('fatGoal').value = '65';
    document.getElementById('maxCookingTime').value = '';
    
    Utils.showToast('Preferences reset to default', 'info');
}

/**
 * Export preferences as JSON
 */
function exportPreferences() {
    const prefs = Storage.getUserPreferences();
    const dataStr = JSON.stringify(prefs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-preferences-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    Utils.showToast('Preferences exported!', 'success');
}

/**
 * Import preferences from JSON
 * @param {File} file - JSON file
 */
function importPreferences(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const importedPrefs = JSON.parse(e.target.result);
            
            if (!importedPrefs || typeof importedPrefs !== 'object') {
                throw new Error('Invalid format');
            }
            
            Storage.saveUserPreferences(importedPrefs);
            loadSavedPreferences();
            Utils.showToast('Preferences imported successfully!', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            Utils.showToast('Failed to import preferences', 'error');
        }
    };
    
    reader.readAsText(file);
}

/* ========================================
   EXPORT
======================================== */

window.Preferences = {
    initPreferencesPage,
    loadSavedPreferences,
    handleSavePreferences,
    handleResetPreferences,
    exportPreferences,
    importPreferences
};