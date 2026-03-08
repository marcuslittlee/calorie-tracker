# Calorie Tracker

## Overview
The Calorie Tracker is a mobile-first web application designed to help users track their food intake, monitor their macros, and visualize their nutritional statistics. The application allows users to search for foods, input their consumption in grams, and automatically calculates calories, protein, carbs, and fat. It also provides a history of past entries and weekly statistics.

## Features
- **Food Search**: Search for foods and view their macro information.
- **Macro Calculation**: Enter grams of food to automatically calculate total calories, protein, carbs, and fat.
- **Daily Totals**: View daily totals of calories and macros.
- **History Page**: Access a history of past days' food tracking with corresponding macros.
- **Statistics Page**: Visualize weekly charts of food intake and nutritional statistics.
- **Offline Functionality**: The app works offline and saves data locally using browser storage.
- **Food Database**: Includes a comprehensive database of at least 500 foods with macro information.

## Project Structure
```
calorie-tracker
├── src
│   ├── index.html
│   ├── history.html
│   ├── statistics.html
│   ├── css
│   │   ├── style.css
│   │   ├── history.css
│   │   └── statistics.css
│   ├── js
│   │   ├── app.js
│   │   ├── foodDatabase.js
│   │   ├── tracker.js
│   │   ├── history.js
│   │   ├── statistics.js
│   │   ├── storage.js
│   │   └── utils.js
│   └── data
│       └── foods.json
├── manifest.json
└── README.md
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser to start using the application.
3. For offline use, ensure your browser supports local storage.

## Usage Guidelines
- Use the food search feature to find foods and their macro information.
- Enter the amount of food consumed in grams to see the calculated macros.
- Navigate to the history page to view past entries and their details.
- Check the statistics page for weekly charts and insights into your food intake.

## Technologies Used
- HTML, CSS, JavaScript
- Local Storage for offline functionality
- Charting library for visualizing statistics (to be implemented)

## Contribution
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.