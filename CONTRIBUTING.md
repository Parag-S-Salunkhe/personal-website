# Contributing Guide

Thank you for your interest in contributing to this project! This guide will help you get started.

## Getting Started

1. **Fork the repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally

2. **Set up the development environment**
   ```bash
   git clone https://github.com/yourusername/personal-website.git
   cd personal-website
   npm install
   docker-compose up -d
   npx prisma migrate dev
   npm run dev
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Code Style

- Use TypeScript for all new files
- Follow the existing code structure
- Use Tailwind CSS for styling
- Keep components small and focused
- Write meaningful commit messages

### Commit Messages

Follow conventional commits:
```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

Examples:
```
feat: add dark mode toggle
fix: resolve 3D animation performance issue
docs: update API documentation
```

### Testing

Before submitting:
- Test all pages load correctly
- Verify responsive design
- Check API endpoints work
- Test 3D animations
- Verify database operations

### Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Update CHANGELOG.md** if applicable
4. **Submit PR** with clear description

PR Template:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All pages work
- [ ] API endpoints tested
- [ ] Responsive design verified

## Screenshots (if applicable)
Add screenshots here
```

## Project Structure

```
personal-website/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/             # Utility functions
├── prisma/          # Database schema and migrations
├── public/          # Static assets
└── scripts/         # Build and deployment scripts
```

## Adding New Features

### Adding a New Page

1. Create page file: `app/newpage/page.tsx`
2. Add to navigation: `components/shared/Navigation.tsx`
3. Create API route if needed: `app/api/newpage/route.ts`
4. Add Prisma model if needed: `prisma/schema.prisma`
5. Update documentation

### Adding a New Component

1. Create component file in appropriate directory
2. Use TypeScript interfaces for props
3. Add JSDoc comments
4. Export as default

Example:
```typescript
interface MyComponentProps {
  title: string
  description?: string
}

/**
 * MyComponent displays a title and optional description
 */
export default function MyComponent({ title, description }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  )
}
```

### Adding a New API Endpoint

1. Create route file: `app/api/endpoint/route.ts`
2. Implement GET and POST handlers
3. Add error handling
4. Update API documentation

Example:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const data = await prisma.model.findMany()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
```

## Database Changes

### Adding a New Model

1. Update `prisma/schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name add_new_model
   ```
3. Update seed file if needed
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

### Modifying Existing Model

1. Update schema
2. Create migration with descriptive name
3. Test migration on local database
4. Update affected API routes and components

## Styling Guidelines

### Tailwind CSS

- Use existing theme colors
- Follow mobile-first approach
- Use consistent spacing scale
- Leverage Tailwind utilities

### Custom Styles

- Only add custom CSS when necessary
- Use CSS modules or globals.css
- Document custom styles

### Responsive Design

Test on:
- Mobile (320px - 640px)
- Tablet (640px - 1024px)
- Desktop (1024px+)

## Performance Considerations

- Optimize images (use Next.js Image component)
- Lazy load heavy components
- Minimize bundle size
- Use React.memo for expensive components
- Implement proper loading states

## Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

## Security

- Never commit sensitive data
- Use environment variables
- Validate user input
- Sanitize database queries (Prisma handles this)
- Implement rate limiting for production

## Documentation

Update documentation when:
- Adding new features
- Changing API endpoints
- Modifying database schema
- Updating dependencies
- Changing configuration

Files to update:
- README.md
- API_DOCUMENTATION.md
- SETUP.md
- PROJECT_OVERVIEW.md

## Code Review Guidelines

When reviewing PRs:
- Check code quality and style
- Verify functionality
- Test edge cases
- Review documentation updates
- Check for security issues
- Verify performance impact

## Getting Help

- Open an issue for bugs
- Start a discussion for questions
- Check existing issues first
- Provide detailed information

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be added to the README.md file.

---

Thank you for contributing! 🎉
