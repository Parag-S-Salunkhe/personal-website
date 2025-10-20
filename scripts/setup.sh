#!/bin/bash

# Personal Website Setup Script
# This script automates the initial setup process

set -e

echo "🚀 Personal Website Setup"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need Docker to run PostgreSQL."
    echo "   Visit: https://www.docker.com/get-started"
    echo ""
    read -p "Continue without Docker? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    SKIP_DOCKER=true
else
    echo "✅ Docker detected"
    SKIP_DOCKER=false
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ "$SKIP_DOCKER" = false ]; then
    echo ""
    echo "🐳 Starting PostgreSQL with Docker..."
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
    
    echo ""
    echo "🗄️  Setting up database..."
    npx prisma migrate dev --name init
    
    echo ""
    echo "🌱 Seeding database with sample data..."
    npx prisma db seed
    
    echo ""
    echo "✅ Database setup complete!"
else
    echo ""
    echo "⚠️  Skipping database setup. Make sure to:"
    echo "   1. Set up PostgreSQL manually"
    echo "   2. Update DATABASE_URL in .env"
    echo "   3. Run: npx prisma migrate dev"
    echo "   4. Run: npx prisma db seed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the development server: npm run dev"
echo "  2. Open http://localhost:3000 in your browser"
echo "  3. (Optional) Open Prisma Studio: npx prisma studio"
echo ""
echo "📚 For more information, see:"
echo "  - README.md"
echo "  - SETUP.md"
echo "  - PROJECT_OVERVIEW.md"
echo ""
