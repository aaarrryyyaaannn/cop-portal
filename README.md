# Police FIR Management Portal

PWA with offline-first architecture, MongoDB, JWT & role-based authentication.

## Deploy to Vercel

1. **Push to GitHub** (or GitLab/Bitbucket)

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project → Import your repo
   - Framework: Other (no framework)
   - Root Directory: `./` (project root)

3. **Environment Variables** (Vercel Dashboard → Project → Settings → Environment Variables)
   - `MONGODB_URI` – MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/fir-portal`)
   - `JWT_SECRET` – Strong random string for JWT signing

4. **Deploy** – Vercel will run `npm run build` and deploy.

5. **Seed data** (first time)
   - Run locally: `cd backend && npm run seed` (with `MONGODB_URI` set)
   - Or use MongoDB Atlas UI to add users: admin / admin123, officer1 / officer123, citizen1 / citizen123

## Local Development

```bash
npm install
cd backend && npm run seed && npm run dev   # Terminal 1 - backend on :3001
npm run dev                                  # Terminal 2 - frontend on :5173
```

## Login

| Role   | Username | Password   |
|--------|----------|------------|
| Admin  | admin    | admin123   |
| Officer| officer1 | officer123 |
| Citizen| citizen1 | citizen123 |
