const foods = require('./src/data/foods.json');
console.log('count', foods.length);
console.log('chicken entries sample:', foods.filter(f => f.name.toLowerCase().includes('chicken')).slice(0, 5));
