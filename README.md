# Police FIR Management Portal

PWA with offline-first architecture, MongoDB, JWT & role-based authentication.  
**Single repo** – frontend + backend deployed together on Vercel.

## Deploy to Vercel

### Option A: Vercel Dashboard

1. **Push to GitHub**  
   Create a repo and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/fir-portal.git
   git push -u origin main
   ```

2. **Import on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Framework: **Other** (or leave as auto-detected)
   - Root Directory: `./`

3. **Environment Variables** → Project → Settings → Environment Variables  
   - `MONGODB_URI` – MongoDB Atlas URI (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/fir-portal`)  
   - `JWT_SECRET` – Strong random string (e.g. `openssl rand -hex 32`)

4. **Deploy** – Vercel will run `npm run build` and deploy.

### Option B: Vercel CLI

```bash
npx vercel login
npx vercel
# Add MONGODB_URI and JWT_SECRET when prompted
```

### Seed MongoDB (first time)

```bash
cd backend
cp .env.example .env   # Add your MONGODB_URI
npm run seed
```

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
