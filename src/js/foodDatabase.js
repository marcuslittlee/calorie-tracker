const foodDatabase = {
    foods: [],

    async initialize() {
        await this.loadFoods();
        console.log('Food database initialized with', this.foods.length, 'foods');
    },

    async loadFoods() {
        try {
            console.log('Loading foods from ./data/foods.json...');
            const response = await fetch('./data/foods.json');
            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            this.foods = await response.json();
            console.log('Successfully loaded', this.foods.length, 'foods');
        } catch (error) {
            console.error('Error loading food database:', error);
            this.foods = [];
        }
    },

    searchFood(query) {
        const lowerCaseQuery = query.toLowerCase();
        return this.foods.filter(food => 
            food.name.toLowerCase().includes(lowerCaseQuery)
        );
    },

    searchFoods(query) {
        return this.searchFood(query);
    },

    getFoodMacros(foodId) {
        const food = this.foods.find(food => food.id === foodId);
        return food ? {
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat
        } : null;
    }
};

export { foodDatabase };