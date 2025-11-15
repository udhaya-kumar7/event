# Deploying the Backend (Express) - Railway / Render / Heroku

This file documents recommended, safe steps to deploy the backend and link it to the frontend hosted on Vercel.

Required environment variables (see `./.env.example`):
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — JWT signing secret
- `JWT_REFRESH_SECRET` — JWT refresh token secret
- `FRONTEND_BASE_URL` — URL of the frontend (e.g. `https://your-frontend.vercel.app`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — (optional) SMTP settings used for email

Quick deploy (Railway - recommended):
1. Sign in to https://railway.app and create a new project -> Deploy from GitHub.
2. Select your repository and set the Root Directory to `backend`.
3. Railway will detect `package.json`. Set the Start Command to `npm start` if prompted.
4. In Railway -> Project -> Variables, add the required environment variables from `.env.example`.
5. Deploy. Railway will show a public HTTPS URL (e.g. `https://<project>.up.railway.app`).

After deploy:
- Update your frontend `VITE_API_BASE` environment variable in Vercel to point to the Railway URL.
- Confirm CORS: the backend `Server.js` uses `process.env.FRONTEND_BASE_URL` — set it to your Vercel domain.

Tips & production notes:
- Use MongoDB Atlas and create a user with a strong password. Restrict network access to Railway IPs or use a secure IP allowlist.
- Set cookie options to `secure: true` and `sameSite: 'None'` in production if you rely on cross-site cookies.
- Review logs on Railway if anything fails: Railway -> Project -> Logs.

Troubleshooting
- 404 on client routes: ensure `frontend/vercel.json` exists and Vercel project root is `frontend`.
- Auth cookie not set: check CORS and cookie `sameSite`/`secure` settings.
