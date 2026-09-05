# Healsight Prototype

Healsight is an AI-driven health decision partner designed to help users manage medical reports, track health trends, and take actionable steps toward better health. This prototype demonstrates the core user journey, from report management to visual health insights.

## Project Structure

The project is divided into two main parts:
- **`src/frontend`**: A React-based web application built with Vite and TypeScript.
- **`src/backend`**: A Node.js/Express server providing mock data and simulating API interactions.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Getting Started

### 1. Clone and Install Dependencies

First, navigate to the root directory and install dependencies for both the frontend and backend.

```bash
# Install backend dependencies
cd src/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Run the Application

You can run the frontend and backend separately for development, or use the unified development command.

#### Unified Development Command (Recommended)
This command will monitor both frontend and backend changes, automatically rebuilding the frontend and restarting the server as needed.
```bash
cd src/backend
npm run dev
```
The application will be available at `http://localhost:3001`.

#### Manual Development (Separate Terminals)

**Start the Backend Server**
```bash
cd src/backend
node index.js
```
The backend runs on `http://localhost:3001`.

**Start the Frontend Development Server**
```bash
cd src/frontend
npm run dev
```
The frontend will typically run on `http://localhost:5173`.

### 3. Running in Production

To run the application in production mode, you need to build the frontend assets and then start the backend server, which is configured to serve the static build files.

```bash
# 1. Build the frontend
cd src/frontend
npm run build

# 2. Start the unified server
cd ../backend
node index.js
```

Once started, the unified application (both API and Frontend) will be available at `http://localhost:3001`.

## Deployment

### Deploying to Vercel

The project is configured for seamless deployment on [Vercel](https://vercel.com/). 

1. **Push to GitHub**: Ensure your project is pushed to a GitHub repository.
2. **Import to Vercel**: Connect your repository to Vercel.
3. **Automatic Configuration**: Vercel will use the `vercel.json` file in the root directory to:
   - Build the React frontend.
   - Deploy the Node.js backend as a Serverless Function.
   - Handle routing for both API and static assets.

No additional configuration is required in the Vercel dashboard.

## Core Features

- **Health Dashboard**: Summary of your health status with AI-driven insights.
- **Trends Visualization**: Detailed historical charts for various biomarkers (e.g., ALT, AST, Glucose).
- **Report Management**: Browse through 5 years of historical medical reports.
- **Action Hub**: Manage "Micro-actions" and follow-up medical suggestions.
- **Report Upload Simulation**: Experience the multi-stage OCR and analysis flow.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Recharts, Lucide-React.
- **Backend**: Node.js, Express.
- **Styling**: Vanilla CSS with CSS variables (Mobile-first design).

---

Developed as a high-fidelity prototype to validate health information visualization and AI coach interactions.
