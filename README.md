# Premium Personal Website 🚀

A modern, multi-themed personal website built with Next.js 14, featuring unique designs for different content types. Each page has its own distinct visual identity and purpose, creating a cohesive yet diverse digital experience.

## Features

- **Home Page**: 3D animated hero with Three.js and health tracking charts
- **Movies Page**: Cinematic theme for movie reviews and ratings
- **Blog Page**: Editorial theme for long-form content
- **Projects Page**: Terminal-inspired theme for showcasing work
- **Notes Page**: Journal-style theme for quick thoughts
- **Database**: PostgreSQL with Prisma ORM
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design with Tailwind CSS

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Three.js / React Three Fiber
- Framer Motion
- Recharts
- Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker (for PostgreSQL)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Start PostgreSQL with Docker:
```bash
docker-compose up -d
```

5. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The project uses PostgreSQL with Prisma. The schema includes:

- **HealthData**: Daily steps and calories tracking
- **Movie**: Movie and series reviews with ratings
- **Blog**: Long-form blog posts
- **Project**: Portfolio projects with tech stack
- **Note**: Quick journal entries

### Seeding Data (Optional)

You can add sample data through the API routes or directly via Prisma Studio:

```bash
npx prisma studio
```

## Project Structure

```
personal-website/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── blog/              # Blog pages
│   ├── movies/            # Movies page
│   ├── notes/             # Notes page
│   ├── projects/          # Projects page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── home/             # Home page components
│   ├── movies/           # Movie components
│   └── shared/           # Shared components
├── lib/                  # Utility functions
├── prisma/               # Database schema
└── public/               # Static assets
```

## API Routes

- `GET/POST /api/health` - Health data
- `GET/POST /api/movies` - Movie reviews
- `GET/POST /api/blog` - Blog posts
- `GET/POST /api/projects` - Projects
- `GET/POST /api/notes` - Notes

## Customization

### Theme Colors

Edit `tailwind.config.ts` to customize the color schemes for each page:

- `elegant`: Home page colors
- `cinema`: Movies page colors
- `editorial`: Blog page colors
- `terminal`: Projects page colors
- `journal`: Notes page colors

### Adding Content

Use the API routes to add content programmatically, or create an admin interface to manage content through the UI.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Docker

Build and run with Docker:

```bash
docker build -t personal-website .
docker run -p 3000:3000 personal-website
```

## License

MIT

## Author

Your Name
