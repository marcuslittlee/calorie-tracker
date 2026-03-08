function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function calculateDailyCalories(weight, height, age, gender, goal) {
    // Mifflin-St Jeor formula for BMR (Basal Metabolic Rate)
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity factor (assuming light activity)
    const activityFactor = 1.375;
    const tdee = Math.round(bmr * activityFactor);
    
    // Apply goal multiplier
    if (goal === 'lose') {
        return Math.round(tdee * 0.85); // 15% deficit
    } else if (goal === 'gain') {
        return Math.round(tdee * 1.15); // 15% surplus
    }
    return tdee; // maintain
}

const Utils = {
    formatNumber(num) {
        return Number(num).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },

    formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    },

    formatCalories(cal) {
        return Math.round(cal);
    },

    formatMacro(macro) {
        return Math.round(macro * 10) / 10;
    },

    calculateMacros(grams, food) {
        const calories = (grams / 100) * food.calories;
        const protein = (grams / 100) * food.protein;
        const carbs = (grams / 100) * food.carbs;
        const fat = (grams / 100) * food.fat;
        return { calories, protein, carbs, fat };
    },

    getTodayDate() {
        return getTodayDate();
    },

    isValidNumber(value) {
        return !isNaN(value) && value > 0;
    },

    updateDateDisplay() {
        const dateDisplay = document.getElementById('dateDisplay');
        if (dateDisplay) {
            dateDisplay.textContent = this.formatDate(new Date());
        }
    }
};

export { Utils, getTodayDate, calculateDailyCalories };