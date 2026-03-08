// Main JavaScript file for the Calorie Tracker application

import { foodDatabase } from './foodDatabase.js';
import { tracker } from './tracker.js';
import { Utils } from './utils.js';

// Global state for search
let currentSearchResults = [];
let searchTimeout = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initializing...');
    
    // Initialize database
    await foodDatabase.initialize();
    console.log('Food database initialized with', foodDatabase.foods.length, 'foods');
    
    // Check if user has already set up settings
    const userSettings = tracker.initializeSettings();
    if (!userSettings) {
        // Show onboarding modal
        setupOnboarding();
    } else {
        // Hide onboarding modal
        document.getElementById('onboardingModal').classList.add('hidden');
        initializeApp();
    }
});

function setupOnboarding() {
    const form = document.getElementById('onboardingForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        const age = parseInt(document.getElementById('age').value);
        const gender = document.getElementById('gender').value;
        const goal = document.querySelector('input[name="goal"]:checked').value;
        
        // Save settings
        tracker.setUserSettings(weight, height, age, gender, goal);
        
        // Hide modal and initialize app
        document.getElementById('onboardingModal').classList.add('hidden');
        initializeApp();
    });
}

function initializeApp() {
    // Initialize UI
    Utils.updateDateDisplay();
    renderTodayTab();
    setupEventListeners();
    setupTabNavigation();
}

function setupEventListeners() {
    const foodSearch = document.getElementById('foodSearch');
    const selectedFood = document.getElementById('selectedFood');
    const clearFood = document.getElementById('clearFood');
    const grams = document.getElementById('grams');
    const addFoodBtn = document.getElementById('addFoodBtn');
    const searchResults = document.getElementById('searchResults');

    // Search input with debounce
    foodSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length < 1) {
            searchResults.classList.add('hidden');
            currentSearchResults = [];
            return;
        }

        searchTimeout = setTimeout(() => {
            console.log('Searching for:', query);
            const results = foodDatabase.searchFoods(query);
            console.log('Found', results.length, 'results');
            currentSearchResults = results;
            displaySearchResults(results);
        }, 300);
    });

    // Handle search result clicks with event delegation
    searchResults.addEventListener('click', (e) => {
        const resultItem = e.target.closest('.search-result-item');
        if (resultItem) {
            const foodName = resultItem.dataset.foodName;
            const calories = parseFloat(resultItem.dataset.calories);
            const protein = parseFloat(resultItem.dataset.protein);
            const carbs = parseFloat(resultItem.dataset.carbs);
            const fat = parseFloat(resultItem.dataset.fat);
            
            selectFoodResult(foodName, calories, protein, carbs, fat);
        }
    });

    // Clear selected food
    clearFood.addEventListener('click', () => {
        selectedFood.value = '';
        tracker.currentFood = null;
        grams.value = '';
        foodSearch.value = '';
        searchResults.classList.add('hidden');
        validateAddButton();
    });

    // Grams input validation
    grams.addEventListener('input', () => {
        validateAddButton();
    });

    // Add food button
    addFoodBtn.addEventListener('click', () => {
        const gramsValue = parseInt(grams.value);
        if (tracker.currentFood && gramsValue > 0) {
            console.log('Adding food:', tracker.currentFood.name, gramsValue, 'grams');
            tracker.addFoodToday(gramsValue);
            
            // Clear inputs
            foodSearch.value = '';
            selectedFood.value = '';
            grams.value = '';
            searchResults.classList.add('hidden');
            currentSearchResults = [];
            
            renderTodayTab();
            validateAddButton();
        } else {
            alert('Please select a food and enter valid grams');
        }
    });

    // Allow adding food by pressing Enter
    grams.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addFoodBtn.click();
        }
    });

    // Allow selecting food by pressing Enter in search
    foodSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && currentSearchResults.length > 0) {
            selectFoodResult(
                currentSearchResults[0].name,
                currentSearchResults[0].calories,
                currentSearchResults[0].protein,
                currentSearchResults[0].carbs,
                currentSearchResults[0].fat
            );
        }
    });
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No foods found</div>';
        searchResults.classList.remove('hidden');
        return;
    }

    searchResults.innerHTML = results.map((food) => `
        <div class="search-result-item" 
             data-food-name="${food.name.replace(/"/g, '&quot;')}"
             data-calories="${food.calories}"
             data-protein="${food.protein}"
             data-carbs="${food.carbs}"
             data-fat="${food.fat}">
            <div class="result-name">${highlightMatch(food.name, document.getElementById('foodSearch').value)}</div>
            <div class="result-macros">
                ${food.calories} cal | P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fat}g (per 100g)
            </div>
        </div>
    `).join('');

    searchResults.classList.remove('hidden');
}

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

function selectFoodResult(name, calories, protein, carbs, fat) {
    console.log('Selected food:', name);
    tracker.currentFood = { name, calories, protein, carbs, fat };
    document.getElementById('selectedFood').value = name;
    document.getElementById('searchResults').classList.add('hidden');
    document.getElementById('foodSearch').value = '';
    document.getElementById('grams').focus();
    validateAddButton();
}

function validateAddButton() {
    const addBtn = document.getElementById('addFoodBtn');
    const grams = document.getElementById('grams').value;
    addBtn.disabled = !tracker.currentFood || grams < 1;
}

function renderTodayTab() {
    const foods = tracker.getTodayFoods();
    const totals = tracker.getTodayTotals();
    const dailyGoal = tracker.getDailyCalorieGoal();
    const remaining = Math.max(0, dailyGoal - totals.calories);
    const progressPercent = Math.min(100, (totals.calories / dailyGoal) * 100);

    // Update calorie progress bar
    document.getElementById('progressBar').style.width = progressPercent + '%';
    document.getElementById('caloriesCurrent').textContent = Utils.formatCalories(totals.calories) + ' kcal';
    document.getElementById('caloriesRemaining').textContent = 'Goal: ' + Utils.formatCalories(dailyGoal) + ' kcal';
    document.getElementById('calorieTarget').textContent = remaining + ' remaining';

    // Update macros
    document.getElementById('proteinValue').textContent = Utils.formatMacro(totals.protein);
    document.getElementById('carbsValue').textContent = Utils.formatMacro(totals.carbs);
    document.getElementById('fatValue').textContent = Utils.formatMacro(totals.fat);

    // Update foods list
    const foodsList = document.getElementById('foodsList');
    
    if (foods.length === 0) {
        foodsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <p>No foods logged yet. Start by searching for a food!</p>
            </div>
        `;
        return;
    }

    foodsList.innerHTML = foods.map(food => `
        <div class="food-item">
            <div class="food-info">
                <div class="food-name">${food.name}</div>
                <div class="food-macros">${food.grams}g | P: ${Utils.formatMacro(food.protein)}g | C: ${Utils.formatMacro(food.carbs)}g | F: ${Utils.formatMacro(food.fat)}g</div>
            </div>
            <div class="food-calories">${Utils.formatCalories(food.calories)}</div>
            <button class="delete-btn" onclick="removeFood(${food.id})">Delete</button>
        </div>
    `).join('');
}

function removeFood(foodId) {
    tracker.removeFoodFromToday(foodId);
    renderTodayTab();
}

function renderHistoryTab() {
    const historyDays = tracker.getHistoryDays();
    const historyList = document.getElementById('historyList');

    if (historyDays.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No history yet. Start logging food to see your history!</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = historyDays.map(day => `
        <div class="history-day">
            <div class="history-date">${day.displayDate}</div>
            <div class="history-meta">${day.foodCount} food${day.foodCount !== 1 ? 's' : ''} logged</div>
            <div class="history-totals">
                <div class="history-stat">
                    <div class="history-stat-label">Calories</div>
                    <div class="history-stat-value">${Utils.formatCalories(day.totals.calories)}</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-label">Protein</div>
                    <div class="history-stat-value">${Utils.formatMacro(day.totals.protein)}g</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-label">Carbs</div>
                    <div class="history-stat-value">${Utils.formatMacro(day.totals.carbs)}g</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-label">Fat</div>
                    <div class="history-stat-value">${Utils.formatMacro(day.totals.fat)}g</div>
                </div>
            </div>
            <button class="expand-btn" onclick="toggleDayDetails('${day.date}')">View Foods</button>
        </div>
        <div id="details-${day.date}" class="history-details hidden"></div>
    `).join('');
}

function toggleDayDetails(date) {
    const detailsDiv = document.getElementById(`details-${date}`);
    detailsDiv.classList.toggle('hidden');

    if (detailsDiv.classList.contains('hidden')) return;

    const foods = tracker.getFoodsByDate(date);
    detailsDiv.innerHTML = foods.map(food => `
        <div class="history-food-item">
            <div class="history-food-name">${food.name}</div>
            <div class="history-food-macros">${food.grams}g | P: ${Utils.formatMacro(food.protein)}g | C: ${Utils.formatMacro(food.carbs)}g | F: ${Utils.formatMacro(food.fat)}g</div>
            <div class="history-food-calories">${Utils.formatCalories(food.calories)} cal</div>
        </div>
    `).join('');
}

function renderStatisticsTab() {
    const weeklyStats = tracker.getWeeklyStats();
    const averages = tracker.getWeeklyAverages();

    const statsDisplay = document.getElementById('statsDisplay');
    statsDisplay.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Avg Calories</span>
            <span class="stat-value">${Utils.formatCalories(averages.calories)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Avg Protein</span>
            <span class="stat-value">${Utils.formatMacro(averages.protein)}g</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Avg Carbs</span>
            <span class="stat-value">${Utils.formatMacro(averages.carbs)}g</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Avg Fat</span>
            <span class="stat-value">${Utils.formatMacro(averages.fat)}g</span>
        </div>
    `;

    // Draw chart
    drawChart(weeklyStats);
}

function drawChart(stats) {
    const canvas = document.getElementById('caloriesChart');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const padding = 40;
    const width = canvas.width / window.devicePixelRatio - padding * 2;
    const height = canvas.height / window.devicePixelRatio - padding * 2;

    const maxCalories = Math.max(...stats.calories, 2500);
    const barWidth = width / stats.calories.length;

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(padding, padding, width, height);

    // Draw axis labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    stats.dates.forEach((date, i) => {
        const x = padding + barWidth * i + barWidth / 2;
        ctx.fillText(date, x, canvas.height / window.devicePixelRatio - 10);
    });

    // Draw bars
    stats.calories.forEach((cal, i) => {
        const x = padding + barWidth * i + barWidth * 0.1;
        const barHeight = (cal / maxCalories) * height;
        const y = padding + height - barHeight;

        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x, y, barWidth * 0.8, barHeight);

        // Value on top of bar
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(cal, x + barWidth * 0.4, y - 5);
    });
}

function setupTabNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;

            // Update active states
            navBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');

            // Render tab content
            if (tabName === 'historyTab') {
                renderHistoryTab();
            } else if (tabName === 'statisticsTab') {
                renderStatisticsTab();
            }
        });
    });
}