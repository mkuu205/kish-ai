# KISH AI — Complete Setup Guide

> Full-stack AI SaaS with Claude API · Stripe · M-Pesa · OTP Auth · Admin Panel

---

## 📁 GitHub Repository Structure

```
kish-ai/
│
├── backend/                        ← Node.js Express Server
│   ├── server.js                   ← Main server (all routes)
│   ├── package.json                ← Dependencies
│   ├── .env.example                ← Copy this → .env (never commit .env!)
│   ├── .env                        ← YOUR secrets (gitignored)
│   └── db.json                     ← Auto-created JSON database (dev only)
│
├── frontend/                       ← Static HTML/CSS/JS (no build needed)
│   ├── index.html                  ← Main app (landing + chat + auth + OTP)
│   └── admin.html                  ← Admin control panel
│
├── database/
│   └── schema.sql                  ← PostgreSQL schema (for production)
│
├── .gitignore
└── README.md
```

---

## 🔐 API Keys — Where to Get Them

### 1. Anthropic (Claude AI)
- Go to: **https://console.anthropic.com**
- Sign up / Log in
- Click **API Keys** in the left sidebar
- Click **Create Key** → copy the key
- Looks like: `sk-ant-api03-...`
- Add credit card for billing (pay-per-use, very cheap)
- 💡 Free $5 trial credit on signup

### 2. Stripe (Card Payments)
- Go to: **https://dashboard.stripe.com**
- Sign up / Log in
- **Test mode first** (toggle in top-left)
- Go to **Developers → API Keys**
- Copy **Secret key** (starts with `sk_test_...`)
- For `STRIPE_PRO_PRICE_ID`:
  - Go to **Products → Add Product**
  - Name: "Kish AI Pro", Price: $12.00, Billing: Monthly
  - Copy the **Price ID** (starts with `price_...`)
- For `STRIPE_WEBHOOK_SECRET`:
  - Go to **Developers → Webhooks**
  - Click **Add endpoint**
  - URL: `https://your-backend.com/api/stripe/webhook`
  - Events to listen for: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_succeeded`
  - Copy the **Signing secret** (starts with `whsec_...`)

### 3. PayHero (M-Pesa)
- Go to: **https://app.payhero.co.ke**
- Sign up with your business details
- Verify your account (KYC required)
- Go to **Settings → API Keys**
- Copy your **API Username** and **API Password**
- Go to **Payment Channels → My Payment Channels**
- Find your M-Pesa channel → copy the **Channel ID**
- Set your callback URL to: `https://your-backend.com/api/payhero/callback`

### 4. Email (OTP Verification)

**Option A — Gmail (easiest, free):**
1. Enable 2FA on your Gmail: **myaccount.google.com → Security**
2. Go to: **myaccount.google.com → Security → App Passwords**
3. Select app: **Mail**, device: **Other** → Generate
4. Copy the 16-character password (e.g. `abcd efgh ijkl mnop`)
5. Use in `.env`:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```
   ⚠️ Gmail allows ~500 emails/day free

**Option B — SendGrid (recommended for production, 100/day free):**
1. Sign up: **https://sendgrid.com** (free 100 emails/day)
2. Go to **Settings → API Keys → Create API Key** (Full Access)
3. Use in `.env`:
   ```
   EMAIL_SERVICE=SendGrid
   EMAIL_USER=apikey
   EMAIL_PASS=SG.xxxxxxxxxxxxxxxx
   ```

---

## 🚀 Local Development Setup

### Step 1 — Clone and Install
```bash
git clone https://github.com/yourusername/kish-ai.git
cd kish-ai/backend
npm install
```

### Step 2 — Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys (use any text editor)
nano .env
```

### Step 3 — Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy the output → paste into JWT_SECRET in .env
```

### Step 4 — Start Backend
```bash
npm run dev        # Development (auto-restart on changes)
# OR
npm start          # Production
```
✅ Backend runs on: `http://localhost:3001`

### Step 5 — Serve Frontend
```bash
# Option A: VS Code Live Server (install the extension)
# Option B: Python simple server
cd ../frontend
python3 -m http.server 3000
# OR
npx serve . -p 3000
```
✅ Frontend runs on: `http://localhost:3000`

### Step 6 — Update API URL in Frontend
Open `frontend/index.html` and `frontend/admin.html`:
```javascript
// Change this line in both files:
const API = "http://localhost:3001"; // ← development
// To your production URL when deploying:
const API = "https://your-backend.railway.app";
```

---

## 💾 Database Guide

### Development (default — no setup needed)
The backend automatically creates `backend/db.json` when it starts.
This is a simple JSON file — perfect for testing.

### Production (PostgreSQL — RECOMMENDED)

**Why PostgreSQL over JSON file?**
- ✅ Concurrent users (JSON file breaks with multiple users)
- ✅ Proper querying and filtering
- ✅ Data integrity and relationships
- ✅ Backups and point-in-time recovery
- ✅ Works with all hosting platforms

**Free PostgreSQL options:**

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **Neon.tech** | 512MB, 1 branch | Best free option, serverless |
| **Supabase** | 500MB, 2 projects | Also has auth/storage |
| **Railway** | $5 credit/mo | Easiest to deploy |
| **PlanetScale** | 5GB | MySQL-compatible |

**Setup with Neon.tech (recommended):**
1. Go to: **https://neon.tech** → Sign up free
2. Create a new project: "kish-ai"
3. Copy the connection string (looks like `postgresql://user:pass@host/db?sslmode=require`)
4. Add to `.env`: `DATABASE_URL=postgresql://...`
5. Run the schema: Go to Neon SQL editor → paste `database/schema.sql` → Run

**To switch server.js from JSON to PostgreSQL:**
```bash
npm install pg
```
Then replace the `loadDB/saveDB/getUser/updateUser` functions in `server.js` with:
```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function getUser(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows[0] || null;
}
async function updateUser(email, updates) {
  const keys   = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = keys.map((k, i) => `${k} = $${i+2}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE email = $1 RETURNING *`,
    [email.toLowerCase(), ...values]
  );
  return rows[0];
}
```

---

## 🌐 Hosting Guide

### Backend Hosting

| Platform | Cost | Deploy Method | Best For |
|----------|------|---------------|----------|
| **Railway** | $5/mo (free trial) | Connect GitHub → auto-deploy | Easiest overall |
| **Render** | Free (sleeps) / $7 active | Connect GitHub | Good free tier |
| **Heroku** | $7/mo | Heroku CLI | Popular, reliable |
| **DigitalOcean App Platform** | $12/mo | Connect GitHub | Professional |
| **Fly.io** | Free small apps | fly CLI | Good performance |
| **VPS (DigitalOcean/Linode)** | $6/mo | SSH + PM2 | Full control |

**Deploy to Railway (recommended):**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up

# Add environment variables in Railway dashboard
# Settings → Variables → Add all your .env values
```

### Frontend Hosting

| Platform | Cost | Deploy Method |
|----------|------|---------------|
| **Vercel** | Free | Drag & drop or GitHub |
| **Netlify** | Free | Drag & drop or GitHub |
| **Cloudflare Pages** | Free | GitHub connect |
| **GitHub Pages** | Free | Push to gh-pages branch |

**Deploy to Netlify (easiest):**
1. Go to: **https://netlify.com**
2. Drag the `frontend/` folder into the Netlify dashboard
3. Done! You get a URL like `https://kish-ai-xyz.netlify.app`
4. Add a custom domain in Site Settings

### Domain & SSL
- Buy domain: **Namecheap** ($10/yr) or **Cloudflare** (at-cost)
- SSL is automatic on all platforms above
- Set `FRONTEND_URL` and `BACKEND_URL` in backend `.env` to your real domains

---

## 🔧 Production Checklist

Before going live:

- [ ] Switch `STRIPE_SECRET_KEY` from `sk_test_...` to `sk_live_...`
- [ ] Switch `STRIPE_PRO_PRICE_ID` to live price ID
- [ ] Update `STRIPE_WEBHOOK_SECRET` with live webhook
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use PostgreSQL instead of `db.json`
- [ ] Set strong `JWT_SECRET` (64+ char random string)
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Update `FRONTEND_URL` and `BACKEND_URL` to real domains
- [ ] Set PayHero callback URL to your production backend
- [ ] Test Stripe payment in test mode first
- [ ] Test M-Pesa with a real number (PayHero has sandbox)
- [ ] Test OTP emails are delivered (check spam folder)
- [ ] Set up database backups

---

## 👤 Admin Panel

Access: `https://your-site.com/admin.html`

Login with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`.

**Features:**
- 📊 Dashboard with live stats (users, revenue, messages)
- 👥 Users table — search, filter, upgrade/downgrade, delete
- 💳 Payments log — Stripe + M-Pesa with status
- 📋 Activity feed — all events in real-time
- 🔧 System health — API status checks
- 📢 Broadcast emails to all/pro/free users
- 📥 Export users to CSV

---

## 🗂️ .gitignore
```
node_modules/
.env
db.json
*.log
.DS_Store
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI** | Anthropic Claude (claude-sonnet-4-20250514) |
| **Backend** | Node.js + Express |
| **Auth** | JWT + bcrypt + Email OTP |
| **Database** | JSON (dev) → PostgreSQL (prod) |
| **Card Payments** | Stripe Subscriptions |
| **M-Pesa** | PayHero STK Push |
| **Email** | Nodemailer (Gmail / SendGrid) |
| **Frontend** | Vanilla HTML/CSS/JS (no framework) |
| **Admin** | Custom admin panel (vanilla JS) |

---

## 💡 Support

- Stripe docs: https://stripe.com/docs
- PayHero docs: https://docs.payhero.co.ke
- Anthropic docs: https://docs.anthropic.com
- Neon DB: https://neon.tech/docs
