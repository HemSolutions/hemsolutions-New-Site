# HemSolutions Deployment Guide

## Status: READY FOR DEPLOYMENT

This document contains everything needed to deploy the HemSolutions website to production.

---

## Architecture

```
Frontend (one.com)  <--->  Backend API (Render.com)  <--->  PostgreSQL (Render.com)
     ↓                          ↓
Static files              Node.js + Express
(HTML/CSS/JS)             API Routes
```

---

## PART 1: Backend Deployment (Render.com)

### Step 1: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click "New" → "PostgreSQL"
3. Name: `hemsolutions-db`
4. Database: `hemsolutions`
5. User: `hemsolutions`
6. Plan: Starter ($7/month)
7. Click "Create Database"
8. **Copy the "Internal Database URL"** - you'll need it

### Step 2: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repo OR use "Deploy from image"
4. Name: `hemsolutions-api`
5. Environment: `Node`
6. Build Command: `npm install`
7. Start Command: `npm start`
8. Plan: Starter ($7/month)

### Step 3: Configure Environment Variables

In Render Dashboard → hemsolutions-api → Environment:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=<paste from Step 1>
DB_SSL=true
FRONTEND_URL=https://www.hemsolutions.se
JWT_SECRET=<generate with: openssl rand -base64 32>
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
STRIPE_WEBHOOK_SECRET=<GET FROM STRIPE DASHBOARD - see below>
BANKID_ENABLED=false
SWISH_ENABLED=false
LOG_LEVEL=info
```

### Step 4: Initialize Database

After deployment, run migrations:

```bash
# SSH into your Render service (via Render Dashboard → Shell)
node scripts/migrate.js
node scripts/seed.js
```

Or run locally with the production database:
```bash
DATABASE_URL=<your-render-db-url> npm run migrate
DATABASE_URL=<your-render-db-url> npm run seed
```

### Step 5: Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://hemsolutions-api.onrender.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`
4. Copy the **Signing secret** (starts with `whsec_`)
5. Add to Render env vars as `STRIPE_WEBHOOK_SECRET`

---

## PART 2: Frontend Deployment (one.com)

### Step 1: Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates a `dist/` folder with production-ready files.

### Step 2: Upload to one.com

Use SFTP to upload the `dist/` folder contents to one.com:

```bash
sftp -oPort=22 -P22 username@ssh.cddf56yz6.service.one
# or use FileZilla with:
# Host: ssh.cddf56yz6.service.one
# Port: 22
# Protocol: SFTP
# User: (your SFTP username)
# Password: (your SFTP password)
```

Upload ALL contents of `dist/` to the root of your hosting directory.

### Step 3: Configure one.com

1. Set up your domain `www.hemsolutions.se` to point to the hosting
2. Enable HTTPS/SSL certificate in one.com control panel
3. The `.htaccess` file in `dist/` handles SPA routing

---

## PART 3: Verification Checklist

After deployment, verify each function:

### Authentication
- [ ] Customer registration works
- [ ] Customer login works
- [ ] Worker login works  
- [ ] Admin login works
- [ ] Logout works
- [ ] Password reset works (emails sent)

### Booking System
- [ ] Create booking from homepage
- [ ] Select service type
- [ ] Enter address
- [ ] Pick date/time
- [ ] Add details
- [ ] Payment step loads
- [ ] Booking confirmation email received
- [ ] Booking appears in customer dashboard

### Customer Dashboard
- [ ] View my bookings
- [ ] Cancel booking
- [ ] Chat with admin
- [ ] View invoices
- [ ] Pay invoice (Stripe)
- [ ] Update profile
- [ ] Messages/notifications work

### Worker App
- [ ] View assigned jobs
- [ ] Check in/out
- [ ] Update job status
- [ ] Chat with admin
- [ ] View earnings

### Admin Panel
- [ ] View all bookings
- [ ] Assign workers
- [ ] Manage workers
- [ ] Create invoices
- [ ] Send SMS to customers
- [ ] Send emails
- [ ] View analytics
- [ ] Manage settings

### Payments
- [ ] Card payment via Stripe works
- [ ] Payment confirmation email received
- [ ] Invoice marked as paid
- [ ] Swish placeholder shows (integration ready)

### Notifications
- [ ] Booking confirmation SMS (via 46elks)
- [ ] Booking reminder SMS
- [ ] Payment confirmation email
- [ ] Admin gets notified of new bookings

---

## PART 4: API Endpoints Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/health | GET | No | Health check |
| /api/auth/register | POST | No | Register new user |
| /api/auth/login | POST | No | Login |
| /api/auth/me | GET | Yes | Get current user |
| /api/bookings | POST | Yes | Create booking |
| /api/bookings | GET | Yes | List bookings |
| /api/bookings/:id | GET | Yes | Get booking details |
| /api/bookings/:id | PATCH | Yes | Update booking |
| /api/admin/bookings | GET | Admin | All bookings |
| /api/admin/workers | GET | Admin | All workers |
| /api/workers/assignments | GET | Worker | My jobs |
| /api/invoices | GET | Yes | My invoices |
| /api/invoices | POST | Admin | Create invoice |
| /api/payments/create-intent | POST | Yes | Stripe payment |
| /api/payments/webhook | POST | No | Stripe webhook |
| /api/payments/swish | POST | Yes | Swish payment |
| /api/contact | POST | No | Contact form |
| /api/services | GET | No | List services |

---

## PART 5: Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` is correct
- Ensure `DB_SSL=true` for Render PostgreSQL
- Verify database exists and migrations ran

### Email Not Sending
- Check SMTP credentials (send.one.com:465)
- Verify password is correct
- Check spam/junk folders
- Review Render logs for errors

### SMS Not Sending
- Verify 46elks credentials
- Check Swedish phone number format (+46XXXXXXXXX)
- Review 46elks dashboard for delivery status

### Payments Not Working
- Verify Stripe keys are LIVE (not test)
- Check webhook endpoint URL is correct
- Verify webhook secret is set
- Check Stripe dashboard for failed payments

### Frontend Can't Connect to Backend
- Check `VITE_API_URL` points to correct Render URL
- Ensure CORS is configured in backend
- Verify backend is running (check /api/health)

---

## PART 6: Files in This Deployment Package

```
HemeSolutions New website/
├── backend/
│   ├── .env.production          # Production env template
│   ├── render.yaml              # Render deployment config
│   ├── server.js                # Main server
│   ├── scripts/
│   │   ├── migrate.js            # Database migrations
│   │   └── seed.js               # Seed data
│   ├── routes/                   # All API routes
│   ├── services/                 # Email, SMS, notifications
│   └── config/                   # Database, email, SMS config
├── frontend/
│   ├── .env.production          # Frontend env config
│   ├── dist/                    # Built files (ready to upload)
│   ├── src/
│   │   ├── api/api.ts           # API client
│   │   ├── sections/            # All pages/components
│   │   └── contexts/          # Auth context
└── DEPLOY.md                    # This file
```

---

## IMPORTANT CREDENTIALS (KEEP SECURE)

### Stripe (LIVE)
- Secret Key: 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
- Publishable: pk_live_51TNZRfGmvwd0XdBXHXZHrJs0hWbFd675uqS1s7ETUwKnKqhp1iuFtv8YERQyXhilJ9U54euaJswGat1WIE7t9k5M00qqsN8k3q
- **Webhook Secret: MUST be set from Stripe Dashboard**

### 46elks SMS
- Username: u607b9c01f9c92415676e808519720a6a
- Password: E64E37FF81BCAFFBEE19CFE4E3017628

### Email (one.com)
- Address: info@hemsolutions.se
- Password: Mzeeshan786@
- SMTP: send.one.com:465 (SSL)

---

## NEXT STEPS

1. **Create Render PostgreSQL database** (copy URL)
2. **Deploy backend to Render** (set all env vars)
3. **Run database migrations**
4. **Set up Stripe webhook**
5. **Build and upload frontend to one.com**
6. **Run verification checklist**

---

## SUPPORT

If anything fails during deployment:
1. Check Render logs (Dashboard → Logs)
2. Check browser console for frontend errors
3. Test API with curl: `curl https://your-api.onrender.com/api/health`
4. Review this document for troubleshooting

**Your HemSolutions website is ready for production!**
