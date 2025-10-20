# Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** and npm
- **Docker** and Docker Compose (for PostgreSQL)
- **Git**

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- Three.js and React Three Fiber
- Framer Motion
- Recharts
- And more...

### 2. Start PostgreSQL Database

Start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Pull the PostgreSQL 16 Alpine image
- Create a database named `personal_website`
- Expose it on port 5432

To check if the database is running:

```bash
docker-compose ps
```

### 3. Setup Prisma

Generate the Prisma Client and run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

This creates the database tables based on the schema in `prisma/schema.prisma`.

### 4. (Optional) Open Prisma Studio

To view and manage your database with a GUI:

```bash
npx prisma studio
```

This opens a browser interface at `http://localhost:5555`.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Adding Sample Data

You can add data through the API routes using tools like:
- **Postman**
- **curl**
- **Prisma Studio**

### Example: Add Health Data

```bash
curl -X POST http://localhost:3000/api/health \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "steps": 10000,
    "calories": 2500
  }'
```

### Example: Add a Movie

```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "type": "MOVIE",
    "rating": 5,
    "review": "Mind-bending masterpiece by Christopher Nolan.",
    "watchDate": "2024-01-10",
    "posterUrl": ""
  }'
```

### Example: Add a Blog Post

```bash
curl -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is the content of my first blog post...",
    "publishDate": "2024-01-15"
  }'
```

### Example: Add a Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Personal Website",
    "description": "A premium personal website with multiple themed pages",
    "techStack": ["Next.js", "TypeScript", "Tailwind CSS", "Prisma"],
    "githubUrl": "https://github.com/username/project"
  }'
```

### Example: Add a Note

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quick Thought",
    "content": "This is a quick note about something interesting...",
    "category": "Ideas"
  }'
```

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

1. Check if Docker is running:
   ```bash
   docker ps
   ```

2. Check the database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify the DATABASE_URL in `.env` matches your Docker setup

### Port Already in Use

If port 3000 or 5432 is already in use:

- For Next.js: `PORT=3001 npm run dev`
- For PostgreSQL: Edit `docker-compose.yml` to use a different port

### Prisma Issues

If Prisma Client is out of sync:

```bash
npx prisma generate
```

If migrations fail:

```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
4. Deploy

### Deploy with Docker

```bash
docker build -t personal-website .
docker run -p 3000:3000 -e DATABASE_URL="your_database_url" personal-website
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string

Optional environment variables:

- `SAMSUNG_HEALTH_CLIENT_ID`: For Samsung Health integration
- `SAMSUNG_HEALTH_CLIENT_SECRET`: For Samsung Health integration

## Next Steps

1. Customize the theme colors in `tailwind.config.ts`
2. Add your personal information to the home page
3. Start adding content through the API routes
4. Consider building an admin panel for easier content management
5. Add authentication if needed
6. Set up a production database (e.g., Supabase, Railway, or AWS RDS)

## Support

For issues or questions, please refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
