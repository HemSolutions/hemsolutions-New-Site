# HemSolutions Deployment — STEP BY STEP CHECKLIST

Follow this in EXACT order. Don't skip steps.

---

## PHASE 1: RENDER.COM SETUP (Backend + Database)

### Step 1 — Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `hemsolutions`
3. Make it **Private**
4. Click "Create repository"
5. **Copy the repository URL** (looks like `https://github.com/YOURNAME/hemsolutions.git`)
6. **Paste it here so I can push the code**

### Step 2 — Create PostgreSQL Database on Render
1. Go to https://dashboard.render.com
2. Click the **blue "New" button** (top right)
3. Select **"PostgreSQL"**
4. Fill in:
   - Name: `hemsolutions-db`
   - Database: `hemsolutions`
   - User: `hemsolutions`
   - Plan: **Starter** ($7/month)
5. Click **"Create Database"**
6. Wait 1-2 minutes for it to be ready
7. **Copy the "Internal Database URL"** (looks like `postgresql://hemsolutions:password@dpg-xxx.render.com:5432/hemsolutions_db`)
8. **Paste it here so I can set it in the config**

### Step 3 — Create Web Service on Render
1. Go to https://dashboard.render.com
2. Click **"New" → "Web Service"**
3. Choose **"Deploy from GitHub"**
4. Connect your GitHub account if not already
5. Select the `hemsolutions` repository
6. Fill in:
   - Name: `hemsolutions-api`
   - Region: **Frankfurt** (closest to Sweden)
   - Branch: `main` (or `master`)
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Starter** ($7/month)
7. Click **"Create Web Service"**

### Step 4 — Set Environment Variables on Render
After the web service is created, go to Dashboard → hemsolutions-api → Environment

Add these one by one (name = value):

```
NODE_ENV=production
PORT=3001
DATABASE_URL=<paste from Step 2>
DB_SSL=true
FRONTEND_URL=https://www.hemsolutions.se
JWT_SECRET=<I will generate this>
JWT_EXPIRE=7d
SMTP_HOST=send.one.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@hemsolutions.se
SMTP_PASS=Mzeeshan786@
EMAIL_FROM=info@hemsolutions.se
EMAIL_FROM_NAME=HemSolutions Sverige AB
ADMIN_EMAIL=info@hemsolutions.se
ADMIN_PASSWORD=Mzeeshan786@
SMS_PROVIDER=46elks
ELKS_API_USERNAME=u607b9c01f9c92415676e808519720a6a
ELKS_API_PASSWORD=E64E37FF81BCAFFBEE19CFE4E3017628
SMS_FROM=HemSolutions
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51TNZRfGmvwd0XdBXHXZHrJs0hWbFd675uqS1s7ETUwKnKqhp1iuFtv8YERQyXhilJ9U54euaJswGat1WIE7t9k5M00qqsN8k3q
BANKID_ENABLED=false
SWISH_ENABLED=false
LOG_LEVEL=info
```

**Note:** I will generate `JWT_SECRET` and add it. Don't worry about `STRIPE_WEBHOOK_SECRET` yet — we set that in Phase 3.

Click **"Save Changes"**

---

## PHASE 2: STRIPE WEBHOOK SETUP

### Step 5 — After Backend is Deployed on Render
1. Go to https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Endpoint URL: `https://hemsolutions-api.onrender.com/api/payments/webhook`
   (replace `hemsolutions-api` with your actual Render service name if different)
4. Click **"Select events"**
5. Search for and select: `payment_intent.succeeded`
6. Click **"Add endpoint"**
7. On the next screen, find **"Signing secret"**
8. Click **"Reveal"** and **copy the secret** (starts with `whsec_`)
9. **Paste it here so I can add it to Render**

---

## PHASE 3: ONE.COM FRONTEND UPLOAD

### Step 6 — Generate New one.com Password
1. Log in to your one.com control panel
2. Go to **FTP / SSH settings**
3. Reset/change the SFTP password
4. **Give me:**
   - SFTP Username: ________________
   - SFTP Password: ________________
   - Host: `ssh.cddf56yz6.service.one` (or whatever one.com shows)
   - Port: `22`

### Step 7 — I Upload the Frontend
I will upload the `frontend/dist/` folder contents to one.com.

---

## WHAT YOU NEED TO GIVE ME (Summary)

Reply with these 4 items:

```
1. GitHub repo URL: ________________________________

2. Render PostgreSQL URL: ________________________________

3. Stripe Webhook Secret (after Phase 2): ________________________________

4. one.com SFTP credentials:
   Username: ________________________________
   Password: ________________________________
   Host: ________________________________
   Port: ________________________________
```

---

## WHAT I WILL DO (Once You Give Me Everything)

1. **Push code to GitHub**
2. **Connect GitHub to Render** — auto-deploy
3. **Set all environment variables** on Render
4. **Run database migrations** on Render PostgreSQL
5. **Seed test data** (admin, worker, customer accounts)
6. **Add Stripe webhook secret** to Render
7. **Upload frontend** to one.com via SFTP
8. **Verify everything works** — health check, login, booking, payment
9. **Give you the live URLs** and test account credentials

---

## TEST ACCOUNTS (I Will Create These)

After deployment, you can log in with:

- **Admin**: `info@hemsolutions.se` / `Mzeeshan786@`
- **Worker**: `worker@hemsolutions.se` / `Worker123!`
- **Customer**: `customer@hemsolutions.se` / `Customer123!`

---

## COSTS

| Service | Monthly Cost |
|---------|-------------|
| Render PostgreSQL (Starter) | $7 |
| Render Web Service (Starter) | $7 |
| one.com Hosting | You already have |
| Stripe | Per-transaction fees only |
| 46elks SMS | Per-SMS cost (~0.10 SEK each) |
| **Total fixed** | **~$14/month** |

---

## TROUBLESHOOTING

If anything fails:
1. Check Render logs: Dashboard → hemsolutions-api → Logs
2. Test API: `curl https://hemsolutions-api.onrender.com/api/health`
3. Check Stripe webhook delivery attempts in Stripe dashboard
4. Email me the error and I'll fix it

---

**Start with Step 1 — Create the GitHub repo and paste the URL here. I'll do the rest.**
