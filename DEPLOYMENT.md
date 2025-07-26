# 🚀 Deployment Guide for Savings Tracker

This guide provides step-by-step instructions to deploy your savings tracking website on various platforms.

## 📋 Prerequisites

1. **Environment Variables**: Update your `.env.local` file for production:
   ```bash
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your-very-secure-secret-key-here
   DATABASE_URL="file:./prod.db"  # For SQLite
   ```

2. **Database Setup**: For production, consider using PostgreSQL instead of SQLite:
   ```bash
   # Install PostgreSQL adapter
   npm install @prisma/adapter-pg pg

   # Update .env.local
   DATABASE_URL="postgresql://username:password@localhost:5432/savings_tracker"
   ```

## 🌐 Deployment Options

### 1. **Vercel (Recommended - Free & Easy)**

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Deploy**
```bash
vercel --prod
```

**Step 3: Configure Environment Variables**
- Go to your Vercel dashboard
- Navigate to your project settings
- Add environment variables from `.env.local`

**Step 4: Update Database**
- For SQLite: Upload your database file to Vercel
- For PostgreSQL: Use Vercel's PostgreSQL integration

### 2. **Netlify**

**Step 1: Install Netlify CLI**
```bash
npm i -g netlify-cli
```

**Step 2: Build and Deploy**
```bash
npm run build
netlify deploy --prod --dir=.next
```

**Step 3: Configure Environment Variables**
- Go to Netlify dashboard → Site settings → Environment variables
- Add all variables from `.env.local`

### 3. **Railway (Great for PostgreSQL)**

**Step 1: Install Railway CLI**
```bash
npm i -g @railway/cli
```

**Step 2: Deploy**
```bash
railway login
railway init
railway up
```

**Step 3: Add PostgreSQL Database**
```bash
railway add --database
```

### 4. **Docker Deployment**

**Step 1: Create Dockerfile**
```dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Step 2: Create .dockerignore**
```
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.env.local
.git
.gitignore
```

**Step 3: Build and Run**
```bash
docker build -t savings-tracker .
docker run -p 3000:3000 --env-file .env.local savings-tracker
```

### 5. **Heroku**

**Step 1: Install Heroku CLI**
```bash
npm i -g heroku
```

**Step 2: Deploy**
```bash
heroku create your-savings-tracker
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

**Step 3: Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

## 🔧 Production Checklist

### **Before Deployment**
- [ ] Update `.env.local` with production values
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Test build locally: `npm run build`
- [ ] Test production build: `npm start`

### **Security Considerations**
- [ ] Use strong NEXTAUTH_SECRET (generate with: `openssl rand -base64 32`)
- [ ] Enable HTTPS on your domain
- [ ] Set up proper CORS headers
- [ ] Use environment variables for sensitive data

### **Database Migration**
For production, update your `prisma/schema.prisma`:

```prisma
// For PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// For MySQL
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## 🚀 Quick Start Commands

### **Vercel (One-Command Deploy)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Railway (One-Command Deploy)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

## 📊 Platform Comparison

| Platform | Free Tier | Database | SSL | Custom Domain |
|----------|-----------|----------|-----|---------------|
| **Vercel** | ✅ 100GB | PostgreSQL | ✅ | ✅ |
| **Netlify** | ✅ 100GB | PostgreSQL | ✅ | ✅ |
| **Railway** | ✅ $5 credit | PostgreSQL | ✅ | ✅ |
| **Heroku** | ✅ 550 hours | PostgreSQL | ✅ | ✅ |

## 🎯 Recommended Deployment Path

1. **Start with Vercel** (easiest for beginners)
2. **Use Railway** for PostgreSQL database
3. **Connect custom domain** for professional appearance
4. **Monitor usage** and scale as needed

## 📝 Post-Deployment Steps

1. **Test all features** on the deployed version
2. **Set up monitoring** (Vercel Analytics, etc.)
3. **Configure custom domain** if needed
4. **Set up email notifications** for user registration
5. **Add Google Analytics** for usage tracking

## 🔍 Troubleshooting

### **Common Issues**
- **Database connection**: Ensure DATABASE_URL is correct
- **NextAuth**: Check NEXTAUTH_URL matches your domain
- **Build errors**: Run `npm run build` locally first
- **CORS issues**: Configure allowed origins in next.config.js

### **Support Resources**
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

Your savings tracker is ready for production! Choose your preferred platform and follow the steps above to deploy.
