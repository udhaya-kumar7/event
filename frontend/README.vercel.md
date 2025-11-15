# Deploying the Frontend to Vercel

This project uses Vite (React). The frontend should be deployed to Vercel with the project root set to the `frontend` folder.

Steps:
1. In Vercel, import the Git repository and set the Project Root to `frontend`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Ensure `frontend/vercel.json` exists (it rewrites SPA routes to `index.html`).
5. Add environment variable in Vercel Settings:
   - `VITE_API_BASE` = `https://your-backend-url` (point to the deployed backend)
6. Deploy. After deployment, try visiting a nested route, e.g. `/discover`.

Local verification:
```powershell
cd frontend
npm install
npm run build
npx serve dist
# Then open http://localhost:3000 and refresh a nested route to ensure SPA routing works
```

If you see 404s on direct routes after deployment, verify:
- Vercel Project Root is `frontend`.
- `vercel.json` is present in `frontend/`.
- Build succeeded and `dist/index.html` exists in output.
