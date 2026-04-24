# Netlify Quick Deploy Guide for HemSolutions Frontend

This guide helps you deploy the HemSolutions frontend to Netlify for temporary testing.

---

## Quick Deploy (Drag & Drop)

### Step 1: Prepare the Build

The frontend is already built in `/hemsolutions/app/dist/`. The `netlify.toml` configuration is included.

### Step 2: Deploy to Netlify

**Option A: Drag & Drop (Easiest)**

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. In your dashboard, find the **"Sites"** section
3. Drag the entire `dist/` folder to the upload area
4. Netlify will instantly deploy and give you a URL like:
   `https://hemsolutions-abc123.netlify.app`

**Option B: Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to dist folder
cd /root/.openclaw/workspace/hemsolutions/app/dist

# Deploy
netlify deploy --prod --dir=.

# Follow prompts to login and create new site
```

**Option C: Git-based Deploy**

1. Push the dist folder to a GitHub repository
2. In Netlify dashboard, click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account
4. Select the repository
5. Set build settings:
   - **Build command**: (leave empty, already built)
   - **Publish directory**: `dist`
6. Click **"Deploy site"**

---

## Post-Deploy Configuration

### Step 1: Update Frontend API URL

After deploying the backend to Railway:

1. Get your Railway backend URL (e.g., `https://hemsolutions-api.up.railway.app`)
2. In Netlify dashboard, go to **Site settings** → **Environment variables**
3. Add variable:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app/api
   ```
4. Trigger a redeploy

### Step 2: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain: `www.hemsolutions.se`
4. Follow DNS configuration instructions

---

## File Structure for Netlify

```
dist/
├── index.html          # Main HTML file
├── netlify.toml        # Netlify configuration
├── _redirects          # (optional) Additional redirects
├── assets/
│   ├── index-xxx.js    # Main JS bundle
│   └── index-xxx.css   # Main CSS bundle
└── ...images and other static files
```

---

## Testing Your Deployment

### Checklist

- [ ] Site loads without errors
- [ ] All images display correctly
- [ ] Navigation works (SPA routing)
- [ ] Forms submit correctly
- [ ] API calls reach the backend
- [ ] No console errors
- [ ] Mobile responsive

### API Connection Test

```javascript
// In browser console
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

## Troubleshooting

### Page Not Found on Refresh
- `netlify.toml` redirects are configured correctly
- Ensure `/*` → `/index.html` redirect exists

### API Calls Failing
- Check `VITE_API_URL` is set correctly
- Verify CORS is enabled on Railway backend
- Test API endpoint directly in browser

### Images Not Loading
- Check image paths are relative (e.g., `./service-cleaning.jpg`)
- Verify images exist in dist folder

---

## Next Steps

1. **Get your Netlify URL** (e.g., `https://hemsolutions-xyz.netlify.app`)
2. **Add this URL to Railway backend** as `FRONTEND_URL`
3. **Update Stripe webhook** if using custom domain
4. **Test complete flow**: Frontend → API → Database

---

Your temporary Netlify site is ready for testing!
