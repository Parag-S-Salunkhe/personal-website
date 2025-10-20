# Personal Website - Project Overview

## 🎨 Design Philosophy

This premium personal website features **five distinct themed pages**, each with its own unique visual identity and purpose:

### 1. **Home Page** - Elegant & Futuristic
- **Theme**: 3D animated hero with gradient backgrounds
- **Features**: 
  - Interactive 3D sphere using Three.js
  - Health & fitness tracking with Recharts
  - Smooth animations with Framer Motion
- **Color Palette**: Purple, blue, and indigo gradients
- **Use Case**: Welcome visitors and showcase health data

### 2. **Movies Page** - Cinematic Experience
- **Theme**: Dark, Netflix-inspired design
- **Features**:
  - Movie and series reviews with star ratings
  - Cinematic card layouts
  - Watch date tracking
- **Color Palette**: Black background with red accents (#e50914)
- **Use Case**: Personal movie diary and reviews

### 3. **Blog Page** - Editorial & Professional
- **Theme**: Clean, newspaper-style layout
- **Features**:
  - Long-form content support
  - Featured images
  - Publication dates
  - Individual blog post pages
- **Color Palette**: White background with dark text and blue accents
- **Use Case**: Thought leadership and storytelling

### 4. **Projects Page** - Terminal/Developer Theme
- **Theme**: Hacker-style terminal interface
- **Features**:
  - Typing animation effect
  - Tech stack badges
  - GitHub and live project links
  - Monospace font
- **Color Palette**: Dark background with green terminal text (#00ff41)
- **Use Case**: Portfolio showcase

### 5. **Notes Page** - Journal/Scrapbook
- **Theme**: Warm, handwritten journal aesthetic
- **Features**:
  - Masonry grid layout
  - Category filtering
  - Slight rotation effects for authenticity
  - Tag system
- **Color Palette**: Cream background (#fef6e4) with pink accents (#f582ae)
- **Use Case**: Quick thoughts and personal reflections

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme extensions
- **Animations**: Framer Motion
- **3D Graphics**: Three.js with React Three Fiber
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend Stack
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **API**: Next.js API Routes (REST)
- **Containerization**: Docker & Docker Compose

### Data Models

```prisma
HealthData  → Daily steps and calories tracking
Movie       → Movie/series reviews with ratings
Blog        → Long-form blog posts
Project     → Portfolio projects with tech stack
Note        → Quick journal entries with categories
```

## 📁 Project Structure

```
personal-website/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── health/route.ts     # Health data CRUD
│   │   ├── movies/route.ts     # Movies CRUD
│   │   ├── blog/route.ts       # Blog CRUD
│   │   ├── projects/route.ts   # Projects CRUD
│   │   └── notes/route.ts      # Notes CRUD
│   ├── blog/
│   │   ├── page.tsx            # Blog listing
│   │   └── [id]/page.tsx       # Individual blog post
│   ├── movies/page.tsx         # Movies page
│   ├── projects/page.tsx       # Projects page
│   ├── notes/page.tsx          # Notes page
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── home/
│   │   ├── Hero3D.tsx          # 3D animated hero
│   │   └── HealthChart.tsx     # Health data visualization
│   ├── movies/
│   │   └── MovieCard.tsx       # Movie card component
│   └── shared/
│       └── Navigation.tsx      # Global navigation
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   └── utils.ts                # Utility functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Sample data seeder
├── public/                      # Static assets
├── docker-compose.yml          # PostgreSQL setup
├── Dockerfile                  # Production container
└── Configuration files...
```

## 🎯 Key Features

### 1. **Responsive Design**
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interactions

### 2. **Performance Optimized**
- Server-side rendering (SSR)
- Static generation where possible
- Image optimization
- Code splitting

### 3. **Smooth Animations**
- Page transitions with Framer Motion
- Scroll-based animations
- Hover effects
- Loading states

### 4. **Type Safety**
- Full TypeScript coverage
- Prisma type generation
- Strict mode enabled

### 5. **Developer Experience**
- Hot module replacement
- ESLint configuration
- Prettier-ready
- Docker for consistent environments

## 🚀 Getting Started

### Quick Start
```bash
# Install dependencies
npm install

# Start database
docker-compose up -d

# Setup database
npx prisma migrate dev
npx prisma db seed

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 📊 API Endpoints

All endpoints support GET (list) and POST (create) operations:

| Endpoint | Description |
|----------|-------------|
| `/api/health` | Health data (steps, calories) |
| `/api/movies` | Movie and series reviews |
| `/api/blog` | Blog posts |
| `/api/projects` | Portfolio projects |
| `/api/notes` | Journal notes |

### Example POST Request
```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Matrix",
    "type": "MOVIE",
    "rating": 5,
    "review": "Revolutionary sci-fi masterpiece",
    "watchDate": "2024-01-15"
  }'
```

## 🎨 Customization Guide

### Change Theme Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  cinema: {
    bg: '#0a0a0a',      // Change background
    accent: '#e50914',  // Change accent color
  },
  // ... other themes
}
```

### Add New Page
1. Create `app/newpage/page.tsx`
2. Add route to `components/shared/Navigation.tsx`
3. Create API route if needed: `app/api/newpage/route.ts`
4. Add Prisma model if needed

### Modify 3D Animation
Edit `components/home/Hero3D.tsx`:
- Change colors in `MeshDistortMaterial`
- Adjust rotation speed in `useFrame`
- Modify lighting positions

## 🔐 Security Considerations

- Environment variables for sensitive data
- API routes can be protected with authentication
- Input validation recommended for production
- CORS configuration for external API access
- SQL injection protection via Prisma

## 📈 Future Enhancements

Potential additions:
- [ ] Admin dashboard for content management
- [ ] Authentication (NextAuth.js)
- [ ] Image upload functionality
- [ ] Search functionality
- [ ] RSS feed for blog
- [ ] Comments system
- [ ] Analytics integration
- [ ] Dark/light mode toggle
- [ ] Internationalization (i18n)
- [ ] PWA support

## 🐛 Known Limitations

- No authentication system (add as needed)
- No image upload (uses URLs)
- No rich text editor (plain text)
- No pagination (loads all items)
- No caching layer (add Redis if needed)

## 📝 License

MIT License - Feel free to use for personal or commercial projects

## 🤝 Contributing

This is a personal website template. Feel free to:
- Fork and customize
- Submit issues for bugs
- Suggest improvements
- Share your implementations

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Three.js](https://threejs.org/docs)
- [Framer Motion](https://www.framer.com/motion)

---

**Built with ❤️ using Next.js 14**
