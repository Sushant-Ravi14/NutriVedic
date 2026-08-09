# NutriVedic

NutriVedic is an intelligent, holistic nutrition and kitchen management platform designed to help users track their diet, manage food inventory, and minimize waste.

## Features

- **Personalized Diet Planning**: Generate and track custom diet plans based on your health goals and metrics (BMI, BMR calculations).
- **Smart Food & Barcode Scanning**: Easily log food items using barcode scans (via OpenFoodFacts) or AI-powered image recognition (via Google Gemini).
- **Inventory & Freshness Tracking**: Keep track of what's in your kitchen. Get automated expiration alerts to reduce food waste.
- **Detailed Nutritional Insights**: Access accurate macro and micronutrient data powered by the USDA FoodData Central.
- **Social & Community**: Share recipes, diet plans, and connect with friends.
- **Premium Subscriptions**: Unlock advanced analytics, personalized recommendations, and PDF report generation.
- **Offline Sync**: A robust sync queue system ensures your data is saved and synced when you come back online.

## Project Structure

This repository is split into a monolithic architecture featuring a separate frontend and backend.

### Backend

The backend is built with **Node.js** and **Express.js**, using **MongoDB** (via Mongoose) as the database. 

#### Backend Directory Layout
- `/backend/models`: Mongoose database schemas (e.g., `User`, `DietPlan`, `FoodCache`, `DailySummary`).
- `/backend/controllers`: Business logic for handling API requests.
- `/backend/routes`: Express API route definitions grouped by feature.
- `/backend/middleware`: Core middleware for Authentication (JWT), Role Gating, Rate Limiting, Error Handling, and File Uploads (Multer/Cloudinary).
- `/backend/jobs`: Background cron jobs (e.g., weekly reports, daily summaries, expiration alerts).
- `/backend/utils`: Utility services integrating external APIs (Gemini, USDA, OpenFoodFacts), PDF generation, caching (Redis), and logging.

### Frontend
*(Frontend details coming soon...)*

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB
- Redis (optional, for caching)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with your database URI, JWT secret, and API keys.
4. Start the development server:
   ```bash
   npm run dev
   ```

## License
MIT License