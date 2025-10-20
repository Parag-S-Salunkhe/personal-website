# Deployment Guide

This guide covers deploying your personal website to various platforms.

## Table of Contents
- [Vercel (Recommended)](#vercel-recommended)
- [Docker Deployment](#docker-deployment)
- [Railway](#railway)
- [DigitalOcean](#digitalocean)
- [AWS](#aws)

---

## Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- PostgreSQL database (Supabase, Railway, or Neon recommended)

### Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/personal-website.git
   git push -u origin main
   ```

2. **Create a production database**
   
   Option A: Supabase (Free tier)
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy the connection string from Settings → Database

   Option B: Railway (Free tier)
   - Go to [railway.app](https://railway.app)
   - Create a new PostgreSQL database
   - Copy the connection string

   Option C: Neon (Free tier)
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
   - Click "Deploy"

4. **Run database migrations**
   
   After deployment, run migrations using Vercel CLI:
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

5. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

### Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

---

## Docker Deployment

Deploy using Docker containers.

### Build the Docker image

```bash
docker build -t personal-website .
```

### Run the container

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/database" \
  --name personal-website \
  personal-website
```

### Using Docker Compose (with PostgreSQL)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/personal_website
    depends_on:
      - postgres
  
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: personal_website
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

---

## Railway

Railway provides easy deployment with built-in PostgreSQL.

### Steps

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize project**
   ```bash
   railway init
   ```

4. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Set environment variables**
   Railway automatically sets `DATABASE_URL` for PostgreSQL.

7. **Run migrations**
   ```bash
   railway run npx prisma migrate deploy
   ```

---

## DigitalOcean

Deploy to DigitalOcean App Platform.

### Steps

1. **Create a DigitalOcean account**
   - Go to [digitalocean.com](https://digitalocean.com)

2. **Create a PostgreSQL database**
   - Navigate to Databases
   - Create a PostgreSQL cluster
   - Note the connection string

3. **Deploy the app**
   - Go to App Platform
   - Create a new app
   - Connect your GitHub repository
   - Set environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
   - Configure build settings:
     - Build Command: `npm run build`
     - Run Command: `npm start`

4. **Run migrations**
   Use DigitalOcean's console or run locally:
   ```bash
   DATABASE_URL="your_production_url" npx prisma migrate deploy
   ```

---

## AWS

Deploy to AWS using Elastic Beanstalk or ECS.

### Using Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**
   ```bash
   eb init -p docker personal-website
   ```

3. **Create environment**
   ```bash
   eb create personal-website-env
   ```

4. **Set environment variables**
   ```bash
   eb setenv DATABASE_URL="postgresql://..."
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

### Using ECS (Fargate)

1. **Build and push Docker image to ECR**
   ```bash
   aws ecr create-repository --repository-name personal-website
   docker tag personal-website:latest <account-id>.dkr.ecr.<region>.amazonaws.com/personal-website:latest
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/personal-website:latest
   ```

2. **Create RDS PostgreSQL instance**
   - Use AWS Console or CLI
   - Note the connection string

3. **Create ECS task definition and service**
   - Use AWS Console or CLI
   - Set environment variables
   - Configure networking and load balancer

---

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Verify the application is accessible
- [ ] Test all pages load correctly
- [ ] Verify database connection works
- [ ] Test API endpoints
- [ ] Check 3D animations render properly
- [ ] Verify responsive design on mobile
- [ ] Test form submissions (if any)
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (usually automatic)
- [ ] Enable analytics (Google Analytics, Plausible, etc.)

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SAMSUNG_HEALTH_CLIENT_ID` | Samsung Health API client ID | No |
| `SAMSUNG_HEALTH_CLIENT_SECRET` | Samsung Health API secret | No |
| `NODE_ENV` | Environment (production/development) | Auto-set |

---

## Database Migration Strategy

### For production deployments:

1. **Never use `migrate dev` in production**
   ```bash
   # ❌ Don't do this in production
   npx prisma migrate dev
   
   # ✅ Use this instead
   npx prisma migrate deploy
   ```

2. **Backup before migrations**
   ```bash
   # PostgreSQL backup
   pg_dump $DATABASE_URL > backup.sql
   ```

3. **Test migrations locally first**
   ```bash
   # Test with production-like data
   DATABASE_URL="local_test_db" npx prisma migrate deploy
   ```

---

## Monitoring & Logging

### Recommended tools:

- **Error tracking**: Sentry
- **Analytics**: Vercel Analytics, Google Analytics, or Plausible
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Performance**: Lighthouse CI, WebPageTest

### Add Sentry (example):

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Scaling Considerations

### Database
- Use connection pooling (PgBouncer)
- Enable read replicas for high traffic
- Consider caching layer (Redis)

### Application
- Enable Next.js caching
- Use CDN for static assets
- Implement rate limiting
- Add Redis for session storage

### Infrastructure
- Use load balancer for multiple instances
- Enable auto-scaling
- Set up health checks
- Configure proper logging

---

## Rollback Strategy

If deployment fails:

### Vercel
- Go to Deployments
- Click on previous successful deployment
- Click "Promote to Production"

### Railway
```bash
railway rollback
```

### Docker
```bash
docker pull personal-website:previous-tag
docker stop personal-website
docker run -d --name personal-website personal-website:previous-tag
```

---

## Troubleshooting

### Build fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check for TypeScript errors

### Database connection fails
- Verify DATABASE_URL is correct
- Check if database allows external connections
- Verify SSL mode if required

### 3D animations don't work
- Check if WebGL is supported
- Verify Three.js is properly bundled
- Check browser console for errors

### API routes return 500
- Check server logs
- Verify Prisma Client is generated
- Check database connection

---

## Cost Estimates

### Free Tier Options
- **Vercel**: Free for personal projects
- **Supabase**: 500MB database, 2GB bandwidth
- **Railway**: $5 credit/month
- **Neon**: 3GB storage, 1 project

### Paid Options (Monthly)
- **Vercel Pro**: $20/month
- **Railway**: ~$10-20/month
- **DigitalOcean**: $12-25/month
- **AWS**: Varies ($20-50/month typical)

---

For questions or issues, please open an issue on GitHub.
