# API Documentation

This document describes all available API endpoints for the Personal Website.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All responses are in JSON format.

### Success Response
```json
{
  "id": "clxxx...",
  "field1": "value1",
  "field2": "value2"
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

---

## Health Data API

Manage daily health tracking data (steps and calories).

### GET /api/health

Retrieve all health data entries (last 30 days).

**Response:**
```json
[
  {
    "id": "clxxx123",
    "date": "2024-01-15T00:00:00.000Z",
    "steps": 10000,
    "calories": 2500,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### POST /api/health

Create a new health data entry.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "steps": 10000,
  "calories": 2500
}
```

**Response:** (201 Created)
```json
{
  "id": "clxxx123",
  "date": "2024-01-15T00:00:00.000Z",
  "steps": 10000,
  "calories": 2500,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/health \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "steps": 10000,
    "calories": 2500
  }'
```

---

## Movies API

Manage movie and series reviews.

### GET /api/movies

Retrieve all movie entries (sorted by watch date, newest first).

**Response:**
```json
[
  {
    "id": "clxxx456",
    "title": "Inception",
    "type": "MOVIE",
    "rating": 5,
    "review": "Mind-bending masterpiece...",
    "watchDate": "2024-01-10T00:00:00.000Z",
    "posterUrl": "https://example.com/poster.jpg",
    "createdAt": "2024-01-10T15:20:00.000Z"
  }
]
```

### POST /api/movies

Create a new movie review.

**Request Body:**
```json
{
  "title": "Inception",
  "type": "MOVIE",
  "rating": 5,
  "review": "Mind-bending masterpiece by Christopher Nolan.",
  "watchDate": "2024-01-10",
  "posterUrl": "https://example.com/poster.jpg"
}
```

**Fields:**
- `title` (string, required): Movie or series title
- `type` (enum, required): "MOVIE" or "SERIES"
- `rating` (number, required): 1-5 stars
- `review` (string, required): Your review text
- `watchDate` (string, required): ISO date format
- `posterUrl` (string, optional): URL to poster image

**Response:** (201 Created)
```json
{
  "id": "clxxx456",
  "title": "Inception",
  "type": "MOVIE",
  "rating": 5,
  "review": "Mind-bending masterpiece...",
  "watchDate": "2024-01-10T00:00:00.000Z",
  "posterUrl": "https://example.com/poster.jpg",
  "createdAt": "2024-01-10T15:20:00.000Z"
}
```

**cURL Example:**
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

---

## Blog API

Manage blog posts.

### GET /api/blog

Retrieve all blog posts (sorted by publish date, newest first).

**Response:**
```json
[
  {
    "id": "clxxx789",
    "title": "Building Modern Web Applications",
    "content": "In today's fast-paced digital world...",
    "imageUrl": "https://example.com/blog-image.jpg",
    "publishDate": "2024-01-20T00:00:00.000Z",
    "createdAt": "2024-01-20T09:00:00.000Z",
    "updatedAt": "2024-01-20T09:00:00.000Z"
  }
]
```

### POST /api/blog

Create a new blog post.

**Request Body:**
```json
{
  "title": "Building Modern Web Applications",
  "content": "Full blog post content here...",
  "imageUrl": "https://example.com/blog-image.jpg",
  "publishDate": "2024-01-20"
}
```

**Fields:**
- `title` (string, required): Blog post title
- `content` (string, required): Full blog post content (supports markdown)
- `imageUrl` (string, optional): Featured image URL
- `publishDate` (string, required): ISO date format

**Response:** (201 Created)
```json
{
  "id": "clxxx789",
  "title": "Building Modern Web Applications",
  "content": "Full blog post content...",
  "imageUrl": "https://example.com/blog-image.jpg",
  "publishDate": "2024-01-20T00:00:00.000Z",
  "createdAt": "2024-01-20T09:00:00.000Z",
  "updatedAt": "2024-01-20T09:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is the content of my first blog post. It can be quite long...",
    "publishDate": "2024-01-20"
  }'
```

---

## Projects API

Manage portfolio projects.

### GET /api/projects

Retrieve all projects (sorted by creation date, newest first).

**Response:**
```json
[
  {
    "id": "clxxxabc",
    "title": "Personal Website",
    "description": "A premium personal website...",
    "techStack": ["Next.js", "TypeScript", "Tailwind CSS"],
    "projectUrl": "https://example.com",
    "githubUrl": "https://github.com/username/project",
    "imageUrl": "https://example.com/project-screenshot.jpg",
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
]
```

### POST /api/projects

Create a new project.

**Request Body:**
```json
{
  "title": "Personal Website",
  "description": "A premium personal website with multiple themed pages",
  "techStack": ["Next.js", "TypeScript", "Tailwind CSS", "Prisma"],
  "projectUrl": "https://example.com",
  "githubUrl": "https://github.com/username/project",
  "imageUrl": "https://example.com/screenshot.jpg"
}
```

**Fields:**
- `title` (string, required): Project name
- `description` (string, required): Project description
- `techStack` (array, required): Array of technology names
- `projectUrl` (string, optional): Live project URL
- `githubUrl` (string, optional): GitHub repository URL
- `imageUrl` (string, optional): Project screenshot URL

**Response:** (201 Created)
```json
{
  "id": "clxxxabc",
  "title": "Personal Website",
  "description": "A premium personal website...",
  "techStack": ["Next.js", "TypeScript", "Tailwind CSS", "Prisma"],
  "projectUrl": "https://example.com",
  "githubUrl": "https://github.com/username/project",
  "imageUrl": "https://example.com/screenshot.jpg",
  "createdAt": "2024-01-15T12:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E-Commerce Platform",
    "description": "Full-stack e-commerce solution",
    "techStack": ["React", "Node.js", "MongoDB"],
    "githubUrl": "https://github.com/username/ecommerce"
  }'
```

---

## Notes API

Manage journal notes.

### GET /api/notes

Retrieve all notes (sorted by creation date, newest first).

**Response:**
```json
[
  {
    "id": "clxxxdef",
    "title": "Quick Thought",
    "content": "This is a quick note about something...",
    "category": "Ideas",
    "createdAt": "2024-01-18T14:30:00.000Z",
    "updatedAt": "2024-01-18T14:30:00.000Z"
  }
]
```

### POST /api/notes

Create a new note.

**Request Body:**
```json
{
  "title": "Quick Thought",
  "content": "This is a quick note about something interesting I learned today.",
  "category": "Ideas"
}
```

**Fields:**
- `title` (string, required): Note title
- `content` (string, required): Note content
- `category` (string, optional): Category/tag for organization

**Response:** (201 Created)
```json
{
  "id": "clxxxdef",
  "title": "Quick Thought",
  "content": "This is a quick note...",
  "category": "Ideas",
  "createdAt": "2024-01-18T14:30:00.000Z",
  "updatedAt": "2024-01-18T14:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learning Three.js",
    "content": "Today I learned about mesh materials and lighting effects in Three.js",
    "category": "Learning"
  }'
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid data) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Guestbook API

Manage guestbook messages with rate limiting.

### GET /api/guestbook

Retrieve all guestbook messages (limited to 50 most recent).

**Response:**
```json
[
  {
    "id": "clxxxghi",
    "message": "Great website! Love the design.",
    "emoji": "👍",
    "createdAt": "2024-01-22T10:15:00.000Z",
    "ipHash": "abc123..."
  }
]
```

### POST /api/guestbook

Create a new guestbook message.

**Request Body:**
```json
{
  "message": "Great website! Love the design.",
  "emoji": "👍"
}
```

**Fields:**
- `message` (string, required): Message text (max 500 characters)
- `emoji` (string, optional): Single emoji

**Validation:**
- Message must be 1-500 characters
- Message cannot be empty/whitespace only
- Rate limit: 1 message per 5 minutes per IP

**Response:** (201 Created)
```json
{
  "id": "clxxxghi",
  "message": "Great website! Love the design.",
  "emoji": "👍",
  "createdAt": "2024-01-22T10:15:00.000Z",
  "ipHash": "abc123..."
}
```

**Error Response:** (429 Too Many Requests)
```json
{
  "error": "Please wait 5 minutes before posting another message"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/guestbook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Amazing work!",
    "emoji": "🎉"
  }'
```

### DELETE /api/guestbook?id={messageId}

Delete a guestbook message (admin only).

**Query Parameters:**
- `id` (string, required): Message ID to delete

**Response:**
```json
{
  "success": true
}
```

---

## Mood Voting API

Track visitor moods with daily voting limits.

### GET /api/mood

Retrieve mood voting statistics.

**Response:**
```json
{
  "stats": {
    "happy": 45,
    "fire": 32,
    "neutral": 18,
    "sad": 5,
    "sleepy": 12
  },
  "percentages": {
    "happy": 40,
    "fire": 29,
    "neutral": 16,
    "sad": 4,
    "sleepy": 11
  },
  "total": 112
}
```

### POST /api/mood

Submit a mood vote.

**Request Body:**
```json
{
  "mood": "happy"
}
```

**Fields:**
- `mood` (string, required): One of: "happy", "fire", "neutral", "sad", "sleepy"

**Validation:**
- Mood must be one of the valid options
- Rate limit: 1 vote per 24 hours per IP

**Response:** (201 Created)
```json
{
  "vote": {
    "id": "clxxxjkl",
    "mood": "happy",
    "createdAt": "2024-01-22T11:30:00.000Z",
    "ipHash": "def456..."
  },
  "stats": {
    "happy": 46,
    "fire": 32,
    "neutral": 18,
    "sad": 5,
    "sleepy": 12
  },
  "percentages": {
    "happy": 41,
    "fire": 28,
    "neutral": 16,
    "sad": 4,
    "sleepy": 11
  },
  "total": 113
}
```

**Error Response:** (429 Too Many Requests)
```json
{
  "error": "You can only vote once per day"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/mood \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "fire"
  }'
```

---

## Page Views API

Track total page views.

### GET /api/pageviews

Get current page view count.

**Response:**
```json
{
  "count": 1547,
  "updatedAt": "2024-01-22T12:45:00.000Z"
}
```

### POST /api/pageviews

Increment page view count.

**Response:**
```json
{
  "count": 1548,
  "updatedAt": "2024-01-22T12:46:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/pageviews
```

### PUT /api/pageviews

Reset page view count to 0 (admin only).

**Response:**
```json
{
  "count": 0,
  "updatedAt": "2024-01-22T13:00:00.000Z",
  "message": "Page view count reset to 0"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/pageviews
```

---

## Rate Limiting

The following endpoints implement IP-based rate limiting:

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| POST /api/guestbook | 1 request | 5 minutes |
| POST /api/mood | 1 request | 24 hours |

IP addresses are hashed using SHA-256 for privacy before storage.

## Authentication

Currently, the API is open and does not require authentication. For production use, implement authentication using:
- NextAuth.js
- JWT tokens
- API keys

**Note:** DELETE and PUT endpoints should be protected with authentication in production.

## CORS

By default, Next.js API routes are same-origin. To enable CORS for external access, add middleware.

## Testing the API

### Using cURL
See examples above for each endpoint.

### Using Postman
1. Import the endpoints
2. Set base URL to `http://localhost:3000/api`
3. Set headers: `Content-Type: application/json`
4. Add request body as JSON

### Using JavaScript/Fetch
```javascript
// Example: Create a movie
const response = await fetch('http://localhost:3000/api/movies', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Inception',
    type: 'MOVIE',
    rating: 5,
    review: 'Amazing movie!',
    watchDate: '2024-01-15',
  }),
});

const data = await response.json();
console.log(data);
```

## Future Enhancements

Planned API improvements:
- [ ] PUT/PATCH endpoints for updates
- [ ] DELETE endpoints
- [ ] Pagination support
- [ ] Filtering and search
- [ ] Sorting options
- [ ] Authentication
- [ ] Rate limiting
- [ ] API versioning
- [ ] GraphQL alternative

---

For questions or issues, please refer to the main README.md or open an issue.
