# Quick Start Guide ⚡

Get your personal website running in 5 minutes!

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker** - [Download here](https://www.docker.com/get-started)

## Installation

### Option 1: Automated Setup (Recommended)

```bash
cd /Users/parag/CascadeProjects/personal-website
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The script will:
- Install dependencies
- Start PostgreSQL
- Setup database
- Seed sample data

### Option 2: Manual Setup

```bash
# 1. Navigate to project
cd /Users/parag/CascadeProjects/personal-website

# 2. Install dependencies
npm install

# 3. Start PostgreSQL
docker-compose up -d

# 4. Wait for database to be ready (5 seconds)
sleep 5

# 5. Setup database
npx prisma migrate dev --name init

# 6. Seed sample data (optional)
npx prisma db seed
```

## Start Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser 🎉

## Project Structure

```
/                  → Home (3D hero + health chart)
/movies            → Movie reviews (cinematic theme)
/blog              → Blog posts (editorial theme)
/projects          → Portfolio (terminal theme)
/notes             → Journal entries (journal theme)
```

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database GUI |
| `docker-compose up -d` | Start PostgreSQL |
| `docker-compose down` | Stop PostgreSQL |

## Adding Content

### Via Prisma Studio (GUI)

```bash
npx prisma studio
```

Opens at **http://localhost:5555**

### Via API (cURL)

**Add a Movie:**
```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "type": "MOVIE",
    "rating": 5,
    "review": "Mind-bending masterpiece!",
    "watchDate": "2024-01-15"
  }'
```

**Add a Blog Post:**
```bash
curl -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is my first blog post...",
    "publishDate": "2024-01-15"
  }'
```

**Add a Project:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Project",
    "description": "A cool project I built",
    "techStack": ["Next.js", "TypeScript"],
    "githubUrl": "https://github.com/user/project"
  }'
```

**Add a Note:**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quick Thought",
    "content": "Something interesting I learned today",
    "category": "Learning"
  }'
```

**Add Health Data:**
```bash
curl -X POST http://localhost:3000/api/health \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "steps": 10000,
    "calories": 2500
  }'
```

## Troubleshooting

### Port 3000 already in use
```bash
PORT=3001 npm run dev
```

### Database connection error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres
```

### Prisma Client out of sync
```bash
npx prisma generate
```

### Clear everything and start fresh
```bash
docker-compose down -v
docker-compose up -d
npx prisma migrate reset
npx prisma db seed
```

## Customization

### Change Theme Colors

Edit `tailwind.config.ts`:
```typescript
colors: {
  cinema: {
    bg: '#0a0a0a',      // Your color
    accent: '#e50914',  // Your color
  },
}
```

### Add Your Information

Edit `app/page.tsx` to update the home page hero text.

### Modify 3D Animation

Edit `components/home/Hero3D.tsx` to change colors, speed, or shape.

## Deployment

### Deploy to Vercel (Free)

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `DATABASE_URL` environment variable
4. Deploy!

See **DEPLOYMENT.md** for detailed guides.

## Documentation

| File | Purpose |
|------|---------|
| **README.md** | Main overview |
| **SETUP.md** | Detailed setup guide |
| **API_DOCUMENTATION.md** | API reference |
| **DEPLOYMENT.md** | Deployment guides |
| **PROJECT_OVERVIEW.md** | Architecture details |

## Get Help

- Check documentation files
- Review error messages in terminal
- Check browser console (F12)
- Verify database is running: `docker-compose ps`

## Next Steps

1. ✅ Get the site running locally
2. 📝 Add your personal content
3. 🎨 Customize colors and themes
4. 🚀 Deploy to production
5. 🌟 Share your website!

---

**Need more help?** See the full documentation in the project root.

**Ready to deploy?** Check out DEPLOYMENT.md

**Want to customize?** See PROJECT_OVERVIEW.md for architecture details

Happy coding! 🚀
