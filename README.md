<div align="center">
  <h1>NutriVedic</h1>
  <p>
    NutriVedic is an intelligent, holistic nutrition and kitchen management platform.<br/>
    It is designed to help users track their personalized diet, manage food inventory effortlessly, and minimize food waste through advanced AI-driven tools.
  </p>
  <p>
    <strong>Team Name:</strong> Code Invaders
  </p>
</div>

---

## Problem Statement

In modern households, tracking nutritional intake accurately and managing food inventory efficiently are significant challenges. Individuals often struggle with adhering to specific dietary requirements due to a lack of personalized guidance. Additionally, poor kitchen inventory management leads to high rates of food waste, as items expire before they are consumed. There is a strong need for an integrated platform that simplifies diet planning while actively helping users reduce waste through smart tracking.

## Solution Overview

- **Personalized Diet Planning**: Generate and track custom diet plans based on your health goals and metrics (BMI, BMR calculations).
- **Smart Food & Barcode Scanning**: Easily log food items using barcode scans (via OpenFoodFacts) or AI-powered image recognition (via Google Gemini).
- **Inventory & Freshness Tracking**: Keep track of what is in your kitchen. Get automated expiration alerts to reduce food waste.
- **Detailed Nutritional Insights**: Access accurate macro and micronutrient data powered by the USDA FoodData Central.
- **Social & Community**: Share recipes, diet plans, and connect with friends.
- **Premium Subscriptions**: Unlock advanced analytics, personalized recommendations, and PDF report generation.
- **Offline Sync**: A robust sync queue system ensures your data is saved and synced when you come back online.

## Presentation & Demonstration

- **Pitch Deck / PPT**: [Click here to view the presentation](#) *(Dummy Link)*
- **Live Demonstration**: [Click here to view the live app](#) *(Dummy Link)*

## Technology Stack

- **Frontend**: React.js, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Caching**: Redis
- **Authentication**: JWT, Google OAuth (Passport.js)
- **AI & External APIs**: Google Gemini Vision API, USDA FoodData Central, OpenFoodFacts
- **File Storage**: Cloudinary

## Team Members

1. **Swaraj Prajapati** - Team Leader
2. **Sushant Ravi** - Team Member

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB
- Redis (optional, for caching)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NutriVedic
   ```

2. **Backend Setup**
   Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file based on `.env.example` and add your database URI, JWT secret, and API keys. Then start the server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   Open a new terminal, navigate to the frontend directory, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

## Folder Structure

This repository is split into a monolithic architecture featuring a separate frontend and backend.

### Backend Structure
- `/backend/models`: Mongoose database schemas (User, DietPlan, FoodCache, DailySummary, etc.).
- `/backend/controllers`: Business logic for handling API requests.
- `/backend/routes`: Express API route definitions grouped by feature.
- `/backend/middleware`: Core middleware for Authentication, Role Gating, Rate Limiting, Error Handling, and File Uploads.
- `/backend/jobs`: Background cron jobs (weekly reports, daily summaries, expiration alerts).
- `/backend/utils`: Utility services integrating external APIs, PDF generation, caching, and logging.

### Frontend Structure
- `/frontend/src/api`: Axios clients and API route definitions for backend communication.
- `/frontend/src/components`: Reusable UI components and layout wrappers (buttons, modals, navigation).
- `/frontend/src/hooks`: Custom React hooks for data fetching, offline syncing, and PWA capabilities.
- `/frontend/src/pages`: Main application views (Dashboard, Scanner, Food Log, Reports).
- `/frontend/src/store`: Zustand stores for global state management (Auth, UI, Offline data).
- `/frontend/src/utils`: Helper functions for calculations, date formatting, and image compression.