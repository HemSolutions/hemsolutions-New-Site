#!/bin/bash

# HemSolutions Backend Deployment Script
# This script prepares the backend for deployment to Render.com

set -e

echo "=========================================="
echo "  HemSolutions Backend Deploy Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Run this script from the backend directory."
    exit 1
fi

echo ""
echo "📦 Step 1: Installing dependencies..."
npm install --production

echo ""
echo "🔍 Step 2: Verifying environment variables..."

# Check required env vars
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "SMTP_USER"
    "SMTP_PASS"
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "ELKS_API_USERNAME"
    "ELKS_API_PASSWORD"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "⚠️  Warning: $var is not set"
    else
        echo "✅ $var is set"
    fi
done

echo ""
echo "🗄️  Step 3: Testing database connection..."
node -e "
const { testConnection } = require('./config/database');
testConnection().then(ok => {
  if (ok) console.log('✅ Database connection: OK');
  else console.log('❌ Database connection: FAILED');
  process.exit(ok ? 0 : 1);
}).catch(err => {
  console.log('❌ Database connection error:', err.message);
  process.exit(1);
});
"

echo ""
echo "🏗️  Step 4: Running database migrations..."
node scripts/migrate.js

echo ""
echo "🌱 Step 5: Seeding database..."
node scripts/seed.js

echo ""
echo "🧪 Step 6: Running health check..."
node -e "
const app = require('./server');
const http = require('http');
const server = http.createServer(app);
server.listen(3457, async () => {
  const res = await new Promise(resolve => {
    http.get('http://localhost:3457/api/health', r => {
      let data = '';
      r.on('data', chunk => data += chunk);
      r.on('end', () => resolve({ status: r.statusCode, data: JSON.parse(data) }));
    }).on('error', e => resolve({ status: 0, error: e.message }));
  });
  
  if (res.status === 200) {
    console.log('✅ Health check: PASS');
    console.log('   Database:', res.data.database);
    console.log('   Version:', res.data.version);
  } else {
    console.log('❌ Health check: FAILED');
  }
  
  server.close();
  process.exit(res.status === 200 ? 0 : 1);
});
"

echo ""
echo "=========================================="
echo "  ✅ Backend is ready for deployment!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Commit and push to GitHub, OR"
echo "2. Upload directly to Render via dashboard"
echo "3. Set environment variables in Render dashboard"
echo "4. Deploy!"
echo ""
