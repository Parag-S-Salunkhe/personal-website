import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Health Data
  const healthData = await prisma.healthData.createMany({
    data: [
      { date: new Date('2024-01-01'), steps: 8500, calories: 2300 },
      { date: new Date('2024-01-02'), steps: 10200, calories: 2500 },
      { date: new Date('2024-01-03'), steps: 7800, calories: 2200 },
      { date: new Date('2024-01-04'), steps: 12000, calories: 2800 },
      { date: new Date('2024-01-05'), steps: 9500, calories: 2400 },
    ],
    skipDuplicates: true,
  })
  console.log(`✅ Created ${healthData.count} health data entries`)

  // Seed Movies
  const movie1 = await prisma.movie.create({
    data: {
      title: 'Inception',
      type: 'MOVIE',
      rating: 5,
      review: 'A mind-bending masterpiece by Christopher Nolan. The layered dream sequences and stunning visuals create an unforgettable cinematic experience.',
      watchDate: new Date('2024-01-10'),
    },
  })

  const movie2 = await prisma.movie.create({
    data: {
      title: 'Breaking Bad',
      type: 'SERIES',
      rating: 5,
      review: 'One of the greatest TV series ever made. The character development and storytelling are absolutely phenomenal.',
      watchDate: new Date('2024-01-15'),
    },
  })
  console.log(`✅ Created 2 movie entries`)

  // Seed Blog Posts
  const blog1 = await prisma.blog.create({
    data: {
      title: 'Building Modern Web Applications',
      content: `In today's fast-paced digital world, building modern web applications requires a deep understanding of both frontend and backend technologies. 

The landscape has evolved significantly with the introduction of frameworks like Next.js, which combines the best of server-side rendering and static site generation.

Key considerations when building modern web apps:
1. Performance optimization
2. SEO-friendly architecture
3. Responsive design
4. Accessibility
5. Security best practices

By leveraging these principles, we can create applications that not only look great but also perform exceptionally well across all devices.`,
      publishDate: new Date('2024-01-20'),
    },
  })
  console.log(`✅ Created 1 blog post`)

  // Seed Projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Personal Website',
      description: 'A premium personal website featuring multiple themed pages, 3D animations, and a comprehensive content management system.',
      techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'Three.js'],
      githubUrl: 'https://github.com/username/personal-website',
    },
  })

  const project2 = await prisma.project.create({
    data: {
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce solution with payment integration, inventory management, and real-time analytics.',
      techStack: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
      projectUrl: 'https://example.com',
      githubUrl: 'https://github.com/username/ecommerce',
    },
  })
  console.log(`✅ Created 2 projects`)

  // Seed Notes
  const note1 = await prisma.note.create({
    data: {
      title: 'Learning Three.js',
      content: 'Three.js is an amazing library for creating 3D graphics in the browser. Today I learned about mesh materials and lighting effects.',
      category: 'Learning',
    },
  })

  const note2 = await prisma.note.create({
    data: {
      title: 'Project Ideas',
      content: 'Ideas for future projects:\n- AI-powered code review tool\n- Real-time collaboration platform\n- Personal finance tracker',
      category: 'Ideas',
    },
  })

  const note3 = await prisma.note.create({
    data: {
      title: 'Daily Reflection',
      content: 'Today was productive. Completed the personal website project and learned a lot about Next.js 14 App Router.',
      category: 'Journal',
    },
  })
  console.log(`✅ Created 3 notes`)

  // Seed PageView
  const pageView = await prisma.pageView.create({
    data: {
      count: 0,
    },
  })
  console.log(`✅ Initialized page view counter`)

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
