# 🚀 Vercel Deployment Guide - Savings Tracker

## Quick Deploy (2 minutes)

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy directly
vercel --prod
```

### Method 2: GitHub Integration
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically on push

## 🔧 Pre-Deployment Setup

### 1. Environment Variables
Add these to Vercel dashboard:
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secure-secret-key
DATABASE_URL=file:./vercel.db
```

### 2. Generate Secret Key
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Update Database for Production
For Vercel, we'll use SQLite (works perfectly):

## 📋 Step-by-Step Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
# From project root
vercel --prod
```

### Step 4: Configure Environment Variables
When prompted, add:
- `NEXTAUTH_URL`: Your Vercel URL
- `NEXTAUTH_SECRET`: Generated secret
- `DATABASE_URL`: `file:./vercel.db`

### Step 5: Database Setup
After deployment:
1. Go to Vercel dashboard
2. Navigate to your project
3. Go to Settings → Environment Variables
4. Add the variables above

## 🎯 One-Command Deploy
```bash
# Single command deployment
npx vercel --prod --env NEXTAUTH_URL=https://your-app.vercel.app --env NEXTAUTH_SECRET=your-secret --env DATABASE_URL=file:./vercel.db
```

## 🛠️ Troubleshooting Common Issues

### Issue 1: Build Fails
**Solution**: Ensure all dependencies are installed
```bash
npm install
```

### Issue 2: Database Connection
**Solution**: SQLite works perfectly with Vercel, no changes needed

### Issue 3: NextAuth Configuration
**Solution**: Use the provided environment variables

### Issue 4: Missing Environment Variables
**Solution**: Add them in Vercel dashboard → Settings → Environment Variables

## 📊 Verification Steps

After deployment:
1. Visit your Vercel URL
2. Test registration
3. Create a savings goal
4. Add transactions
5. Check progress tracking

## 🚀 Alternative: GitHub Deployment

1. **Create GitHub repository**
2. **Push code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/savings-tracker.git
   git push -u origin main
   ```
3. **Connect to Vercel:**
   - Go to vercel.com
   - Import GitHub repository
   - Add environment variables
   - Deploy

## ✅ Success Checklist

- [ ] Website loads at your Vercel URL
- [ ] Registration works
- [ ] Login works
- [ ] Can create savings goals
- [ ] Can add transactions
- [ ] Progress tracking works

Your savings tracker is now **Vercel-ready**! Use the CLI method for the fastest deployment.
