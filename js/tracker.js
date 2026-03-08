// This file handles tracking food intake and calculating macros

import { getTodayDate, calculateDailyCalories } from './utils.js';

const STORAGE_KEY = 'calorieTrackerData';
const USER_SETTINGS_KEY = 'userSettings';

const tracker = {
    currentFood: null,
    userSettings: null,

    // Initialize with user settings
    initializeSettings() {
        const stored = localStorage.getItem(USER_SETTINGS_KEY);
        if (stored) {
            this.userSettings = JSON.parse(stored);
        }
        return this.userSettings;
    },

    // Save user settings
    // weight, height, age, gender, goal: maintain/lose/gain
    // manualGoal: optional integer to override calculated goal
    setUserSettings(weight, height, age, gender, goal, manualGoal = null) {
        let dailyCalorieGoal;
        if (manualGoal && !isNaN(manualGoal)) {
            // ensure integer
            dailyCalorieGoal = Math.round(manualGoal);
        } else {
            dailyCalorieGoal = calculateDailyCalories(weight, height, age, gender, goal);
        }
        this.userSettings = {
            weight,
            height,
            age,
            gender,
            goal,
            dailyCalorieGoal,
            setupDate: new Date().toISOString()
        };
        localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(this.userSettings));
        return this.userSettings;
    },


    // Get daily calorie goal
    getDailyCalorieGoal() {
        if (!this.userSettings) {
            this.initializeSettings();
        }
        return this.userSettings?.dailyCalorieGoal || 2500; // default fallback
    },

    addFoodToday(grams) {
        if (!this.currentFood || grams < 1) return;

        const today = getTodayDate();
        const foodItem = {
            id: Date.now(),
            name: this.currentFood.name,
            grams: parseInt(grams),
            calories: this._calculateCalories(this.currentFood.calories, grams),
            protein: parseFloat(((this.currentFood.protein / 100) * grams).toFixed(2)),
            carbs: parseFloat(((this.currentFood.carbs / 100) * grams).toFixed(2)),
            fat: parseFloat(((this.currentFood.fat / 100) * grams).toFixed(2))
        };

        const data = this._loadData();
        if (!data[today]) {
            data[today] = [];
        }
        data[today].push(foodItem);
        this._saveData(data);
        this.currentFood = null;
    },

    removeFoodFromToday(foodId) {
        const today = getTodayDate();
        const data = this._loadData();
        if (data[today]) {
            data[today] = data[today].filter(food => food.id !== foodId);
            this._saveData(data);
        }
    },

    getTodayFoods() {
        const today = getTodayDate();
        const data = this._loadData();
        return data[today] || [];
    },

    getTodayTotals() {
        const foods = this.getTodayFoods();
        return foods.reduce((totals, food) => ({
            calories: totals.calories + food.calories,
            protein: totals.protein + food.protein,
            carbs: totals.carbs + food.carbs,
            fat: totals.fat + food.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    },

    getHistoryDays() {
        const data = this._loadData();
        return Object.keys(data).sort().reverse().map(date => ({
            date,
            displayDate: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            foodCount: data[date].length,
            totals: this._calculateDayTotals(data[date])
        }));
    },

    getFoodsByDate(date) {
        const data = this._loadData();
        return data[date] || [];
    },

    getWeeklyStats() {
        const data = this._loadData();
        const dates = Object.keys(data).sort();
        const last7Days = dates.slice(-7);
        
        return {
            dates: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
            calories: last7Days.map(d => this._calculateDayTotals(data[d]).calories)
        };
    },

    getWeeklyAverages() {
        const stats = this.getWeeklyStats();
        const count = stats.calories.length || 1;
        const totalCals = stats.calories.reduce((a, b) => a + b, 0);
        const data = this._loadData();
        const allFoods = Object.values(data).flat();
        
        const totals = allFoods.reduce((t, f) => ({
            calories: t.calories + f.calories,
            protein: t.protein + f.protein,
            carbs: t.carbs + f.carbs,
            fat: t.fat + f.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        return {
            calories: Math.round(totalCals / count),
            protein: Math.round(totals.protein / (allFoods.length || 1)),
            carbs: Math.round(totals.carbs / (allFoods.length || 1)),
            fat: Math.round(totals.fat / (allFoods.length || 1))
        };
    },

    _calculateCalories(caloriesPer100, grams) {
        return parseFloat(((caloriesPer100 / 100) * grams).toFixed(2));
    },

    _calculateDayTotals(foods) {
        return foods.reduce((totals, food) => ({
            calories: totals.calories + food.calories,
            protein: totals.protein + food.protein,
            carbs: totals.carbs + food.carbs,
            fat: totals.fat + food.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    },

    _loadData() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    },

    _saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
};

export { tracker };