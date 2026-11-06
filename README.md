# AI-Enabled Food Expiry & Nutrition Tracker

A student project starter application for tracking food inventory, expiry dates and nutrition information. The application uses Express and MongoDB, with a responsive browser interface.

## Features

- Add food items with category, expiry date, quantity and calories per serving
- View food inventory
- See total, expired, expiring-soon and safe item counts
- Delete food items
- REST API built with Express
- MongoDB persistence using Mongoose

## Technology stack

Node.js, Express.js, MongoDB, Mongoose, HTML, CSS and JavaScript.

## Run locally

1. Install Node.js and MongoDB, or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` in `.env` to your MongoDB connection string.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the application:
   ```bash
   npm start
   ```
6. Open `http://localhost:3000`.

## API endpoints

- `GET /api/health` — check server status
- `GET /api/foods` — list food items
- `POST /api/foods` — add a food item
- `DELETE /api/foods/:id` — delete a food item
- `GET /api/summary` — get inventory summary

## Project structure

```text
food-expiry-nutrition-tracker/
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── public/
    ├── index.html
    ├── styles.css
    └── script.js
```

## Important project note

This starter currently provides expiry-date tracking and user-entered nutrition fields. It does not yet use an AI model to recognize food or calculate nutrition automatically. Those features can be added and tested as a separate enhancement. Do not commit your real `.env` file or database credentials.
