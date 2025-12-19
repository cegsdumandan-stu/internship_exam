# Simple Login & Geo-Location App

This project consists of a React frontend and a Node.js/Express backend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes with Node.js)

## Installation & Setup

### 1. Backend Setup

The backend runs on port `8000`.

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backendapi
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   *You should see: "Server is running on http://localhost:8000"*

### 2. Frontend Setup

The frontend runs on port `5173` (default for Vite).

1. Open a **new** terminal window and navigate to the root directory of the project:
   ```bash
   # If you are in backendapi, go back one level
   cd ..
   ```
2. Install the dependencies (now includes TailwindCSS):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit the URL shown in the terminal (usually `http://localhost:5173`).

## Usage

- **Login**: Use the demo credentials provided on the login screen (`admin@test.com` / `123456789`).
- **Dashboard**: View your IP location data.
- **Search**: Enter an IP address to lookup its location.
- **History**: View recent searches, select them to view on the map, or bulk delete them.
