# Recipe & Meal Planner

A web application designed to simplify meal planning and cooking for busy individuals and families. Built with HTML, CSS, and vanilla JavaScript, powered by the Spoonacular API.

## Features

- **Recipe Search & Discovery** - Search by ingredients, cuisine, dietary restrictions, and cooking time
- **Recipe Details** - View ingredients, step-by-step instructions, cooking time, and nutritional info
- **Save Favorites** - Save recipes to a favorites list stored in local storage
- **Weekly Meal Planner** - Organize breakfast, lunch, and dinner across a 7-day calendar
- **Shopping List** - Auto-generate a grocery list from your meal plan with print support
- **Nutrition Dashboard** - Track daily calories, protein, carbs, and fat against your goals
- **Dietary Preferences** - Filter by vegetarian, vegan, gluten-free, keto, and more
- **Surprise Me** - Get a random recipe based on your preferences
- **Responsive Design** - Fully responsive for desktop, tablet, and mobile

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Dashboard with today's meals, nutrition summary, and quick actions |
| Search | `search.html` | Recipe search with filters and quick filter pills |
| Meal Planner | `meal-planner.html` | Weekly calendar with drag-and-drop meal slots |
| Shopping List | `shopping-list.html` | Categorized grocery list with print functionality |
| Favorites | `favorites.html` | Saved recipes with sort and filter options |
| Nutrition | `nutrition.html` | Daily/weekly nutrition tracking with progress bars |
| Preferences | `preferences.html` | Dietary restrictions, allergies, and nutrition goals |
| Recipe Detail | `recipe-detail.html` | Full recipe view with ingredients and instructions |

## Tech Stack

- **HTML5** - Semantic markup and accessibility
- **CSS3** - Custom properties, Flexbox, Grid, animations, responsive design
- **JavaScript (ES6+)** - Async/await, modules, DOM manipulation, local storage
- **Spoonacular API** - Recipe data, nutritional information, and search
- **Google Fonts** - Playfair Display (headings) and Inter (body)

## Setup Instructions

1. Clone the repository
2. Get your Spoonacular API key from https://spoonacular.com/food-api
3. Open `js/config.js` and replace the API key:

```javascript
const CONFIG = {
    SPOONACULAR_API_KEY: 'your_actual_api_key_here'
};
```

4. Open `index.html` in your browser or use a local server

## Project Structure

```
Meal-Planner-Project/
├── index.html              # Home / Dashboard
├── search.html             # Recipe Search
├── meal-planner.html       # Weekly Meal Planner
├── shopping-list.html      # Shopping List
├── favorites.html          # Saved Favorites
├── nutrition.html          # Nutrition Dashboard
├── preferences.html        # User Preferences
├── recipe-detail.html      # Recipe Detail View
├── css/
│   ├── styles.css          # Main stylesheet
│   ├── responsive.css      # Media queries & print styles
│   └── animations.css      # CSS animations & transitions
├── js/
│   ├── config.js           # API key configuration
│   ├── api.js              # Spoonacular API integration
│   ├── storage.js          # LocalStorage management
│   ├── utils.js            # Shared utility functions
│   ├── recipe.js           # Recipe display & management
│   ├── main.js             # App entry point & page routing
│   ├── meal-planner.js     # Meal planner functionality
│   ├── shopping-list.js    # Shopping list module
│   ├── favorites.js        # Favorites page logic
│   ├── nutrition.js        # Nutrition dashboard
│   └── preferences.js      # Preferences form handling
└── README.md
```

## Live Site

https://asimi1234.github.io/Meal-Planner-Project/

## Author

Israel
