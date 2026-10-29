 MILO

MILO is a gen AI-powered, story-led web application that brings learning and caregiver support together.
It brings interactive stories, practical activities, and caregiver progress information together in one platform.
It combines social skills, practical life skills, and subject learning in engaging adventures.
MILO aims to help caregivers better understand and support their child, while offering flexible pacing and levels of challenge to suit different learning preferences and sensory needs.

## Links

- **Live app:** https://milo-learning-app-0cei.onrender.com/
- **Source code:** https://github.com/hamsineeganesh/milo-learning-app
- **Installation guide:** See `docs/INSTALLATION_GUIDE.md`

The deployed Ask MILO feature is currently **not confirmed working**. The backend is deployed, but the Parent Guide request still needs end-to-end verification. It works when set up and run as localhost.

Features

*Track learning progress: Caregivers can view completed levels and learning activity in the dashboard. Progress is saved in the current browser.
*Set preferences: Caregivers can adjust the available preferences, such as sound, narration, and visual comfort.
*Story-led interactive learning: Children practise subject knowledge and everyday skills through interactive stories, including planting and smart shopping.
*Ask MILO (local prototype): Caregivers can ask for AI-generated, personalised suggestions to help support their child; the feature works in the local prototype, the deployed version isstill being resolved.

Technology

- React and Vite frontend
- Express.js backend
- Gemini API via the server-side `@google/genai` SDK
- Browser local storage for this prototype's profile and progress
- Render Static Site for the frontend and Render Web Service for the backend


## Data and safety

Profile and progress information are stored in the current browser and are not synced between devices. MILO provides educational support, not diagnosis or medical care. It does not replace advice from a qualified professional.
