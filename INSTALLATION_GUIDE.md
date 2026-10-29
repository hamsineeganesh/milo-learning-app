# MILO Installation Guide

This guide explains how to open the live app, run MILO on a Windows computer, and configure its two Render services. The frontend and backend run separately: the frontend displays the app, while the backend handles Gemini requests for Ask MILO.

## 1. Open the live app

Visit: https://milo-learning-app-0cei.onrender.com/

The backend URL is not the website people use. Opening the backend root or `/api/milo` directly in a browser may show `Cannot GET`. That is expected because the app sends POST requests to API routes; the backend does not serve a normal web page.

## 2. What you need to run MILO locally

- Windows with PowerShell
- Node.js installed (the deployed service currently uses Node.js 24)
- Internet access to download the repository and npm packages
- A Gemini API key only if you want to use Ask MILO

In Windows PowerShell, use `npm.cmd` for npm commands. This avoids the PowerShell script-policy error that can appear when using `npm`.

## 3. Download the source code

Open PowerShell and run:

```powershell
git clone https://github.com/hamsineeganesh/milo-learning-app.git
cd milo-learning-app
npm.cmd install
```

`npm.cmd install` downloads the frontend packages listed in the root `package.json` and `package-lock.json`.

## 4. Configure the frontend for local use

In the project root (the same folder as the root `package.json`), create a file named `.env.local` containing:

```env
VITE_MILO_API_URL=http://localhost:5000/api/milo
```

This tells the frontend to send Ask MILO requests to your local backend. If you create or edit this file while Vite is already running, stop and restart the frontend so it reloads the environment value.

## 5. Start the frontend

Open a PowerShell window in the project root and run:

```powershell
npm.cmd run dev
```

Vite prints a local URL in the terminal, usually `http://localhost:5173/`. If that port is busy, Vite may use another one, such as `http://localhost:5174/`. Open the exact URL printed by Vite.

Keep this PowerShell window open while using MILO.

## 6. Configure and start the backend

Open a second PowerShell window in the project root. Install the backend packages and enter its folder:

```powershell
cd server
npm.cmd install
```

Create a file named `.env` inside the `server` folder. Add your own Gemini key:

```env
GEMINI_API_KEY=YOUR_PRIVATE_GEMINI_API_KEY
```

Replace the placeholder with your key. Do not include quotes unless your key itself requires them. Never commit this file or paste the key into public documents, GitHub, frontend code, or screenshots.

Start the backend from inside the `server` folder:

```powershell
npm.cmd start
```

The terminal should report that the Milo AI Server is running at `http://localhost:5000`. Keep this second window open too. The locally running Parent Guide can now send requests to Gemini, provided the key is valid and the selected Gemini model is available.

## 7. Stop the local servers

In each PowerShell window, press **Ctrl+C** to stop the process. To use MILO locally again, start both the frontend and backend using the commands above.

## 8. Render deployment configuration

MILO is deployed as two Render services. These are configured separately.

### Frontend: Static Site (`milo-learning-app`)

- **Root Directory:** leave blank (repository root)
- **Build Command:** `npm install && npx vite build`
- **Publish Directory:** `dist`
- **Environment variable:**

```text
VITE_MILO_API_URL=https://milo-learning-api.onrender.com/api/milo
```

After changing a frontend environment variable, save it and allow the Static Site to deploy again. Vite uses this value when it builds the frontend.

### Backend: Web Service (`milo-learning-api`)

- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Environment variable:** `GEMINI_API_KEY` set to your private Gemini API key in this Web Service's Environment settings.

The backend key belongs only in the backend Web Service settings. Do not put `GEMINI_API_KEY` in the Static Site environment or source code.

## 9. Troubleshooting

### PowerShell says running scripts is disabled

Use `npm.cmd` instead of `npm`, for example `npm.cmd install` or `npm.cmd run dev`. You do not need to change the computer's execution policy.

### The frontend opens on a different port

Use the URL printed by Vite. A second local server may already be using port 5173, so Vite selects another port.

### The backend says `Cannot GET /` or `Cannot GET /api/milo`

This message appears when a browser sends a GET request directly to a POST-only API. It does not by itself mean the server is offline. Test the backend through the MILO app.

### Ask MILO does not respond locally

Check that both terminals are still running, `.env.local` points to `http://localhost:5000/api/milo`, and `server/.env` contains a valid `GEMINI_API_KEY`. Check the backend terminal for the error after submitting a question. The local AI request may also fail if the API key, account quota, or Gemini model is unavailable.

### Ask MILO works locally but not on Render

Confirm that the backend Web Service is live and has `GEMINI_API_KEY` in its Environment settings. Confirm the Static Site has the deployed API URL shown above and that its latest deployment completed. Render's free backend may spin down after inactivity, so the first request can take longer to start.

### A Render deploy fails with `Cannot find module .../index.js`

For the backend Web Service, set **Root Directory** to `server` and **Start Command** to `node index.js`. This makes Render run the command from the folder that contains the backend `index.js`.

## 10. Data and safety notes

Child profile and progress information are stored in the current browser's local storage. They are not synced to an account or between devices. Clearing browser site data can remove this locally stored information.

MILO is an educational learning-support prototype, not a diagnostic or medical service. Activities can be adapted or stopped by the caregiver. Seek help from an appropriately qualified professional when specialised assessment or support is needed.
