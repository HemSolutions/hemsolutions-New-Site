# HemSolutions New Website v2.0

## Project Structure

```
HemeSolutions New website/
├── frontend/           # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/       # API services (new backend)
│   │   ├── sections/  # Page sections
│   │   ├── pages/     # Admin pages
│   │   └── ...
│   └── package.json
├── backend/            # Node.js + Express + PostgreSQL
│   ├── server.js
│   ├── config/
│   │   ├── database.js    # PostgreSQL connection
│   │   ├── email.js       # Nodemailer (one.com)
│   │   └── sms.js         # 46elks SMS
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── customers.js
│   │   ├── workers.js
│   │   ├── invoices.js
│   │   ├── payments.js
│   │   ├── admin.js
│   │   ├── contact.js
│   │   └── settings.js
│   ├── services/
│   │   └── notifications.js  # Email + SMS combined
│   ├── cron/
│   │   ├── reminders.js    # Daily/hourly reminders
│   │   └── bookingSync.js  # Auto cleanup
│   ├── scripts/
│   │   ├── migrate.js       # Database migrations
│   │   └── seed.js          # Initial data
│   └── package.json
├── database/           # Schema & migrations
├── docs/              # Documentation
└── render.yaml        # Render deployment config
```

## Backend Setup (Render)

### 1. Create PostgreSQL Database on Render
- Go to Render Dashboard → New → PostgreSQL
- Name: `hemsolutions-db`
- Region: Frankfurt (EU)
- Plan: Starter ($7/month)
- Copy the **Internal Database URL**

### 2. Deploy Backend
- New Web Service on Render
- Connect your GitHub repo
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add Environment Variables:
  - `DATABASE_URL` = (from step 1)
  - `DB_SSL` = `true`
  - `JWT_SECRET` = (generate random string)
  - `SMTP_USER` = `info@hemsolutions.se`
  - `SMTP_PASS` = (your one.com email password)
  - `ELKS_API_USERNAME` = (46elks username)
  - `ELKS_API_PASSWORD` = (46elks password)
  - `STRIPE_SECRET_KEY` = (Stripe secret key)
  - `STRIPE_PUBLISHABLE_KEY` = (Stripe publishable key)

### 3. Initialize Database
```bash
npm run db:migrate
npm run db:seed
```

## Frontend Setup (one.com)

### 1. Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 2. Deploy to one.com
Upload `frontend/dist/` contents to one.com via SFTP.

### 3. Configure API URL
Create `.env.production` in frontend:
```
VITE_API_URL=https://your-render-app.onrender.com
```

## Features Implemented

### Backend
- ✅ PostgreSQL database with proper migrations
- ✅ JWT authentication (customer, worker, admin roles)
- ✅ Booking CRUD with availability checking
- ✅ Automatic email notifications (Nodemailer)
- ✅ Automatic SMS notifications (46elks)
- ✅ Cron jobs: 24h reminders, 1h reminders, auto-cleanup
- ✅ Invoice generation with VAT calculation
- ✅ Stripe payment integration
- ✅ Swish payment ready (needs MSS setup)
- ✅ BankID ready (needs BankID integration)
- ✅ Contact form with email forwarding
- ✅ Admin dashboard stats
- ✅ Worker assignment system

### Frontend (Existing)
- ✅ React + TypeScript + Vite
- ✅ Admin dashboard
- ✅ Customer dashboard
- ✅ Booking flow
- ✅ Invoice management
- ✅ Worker management
- ✅ Settings management
- ✅ Calendar view

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Random secret for JWT | `your-secret-key` |
| `SMTP_USER` | one.com email | `info@hemsolutions.se` |
| `SMTP_PASS` | one.com email password | `your-password` |
| `ELKS_API_USERNAME` | 46elks API username | `u...` |
| `ELKS_API_PASSWORD` | 46elks API password | `...` |
| `STRIPE_SECRET_KEY` | Stripe secret | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public | `pk_test_...` |
| `SWISH_PHONE` | Swish number | `0761234567` |

## Next Steps

1. **Database**: Create PostgreSQL on Render
2. **Backend**: Deploy to Render with env vars
3. **Migrations**: Run `npm run db:migrate`
4. **Seed**: Run `npm run db:seed` (creates admin user)
5. **Frontend**: Build and upload to one.com
6. **Stripe**: Set up webhook endpoint in Stripe dashboard
7. **46elks**: Verify SMS sending works
8. **BankID**: Integrate when ready (code is prepared)
9. **Swish**: Set up MSS when ready (code is prepared)
