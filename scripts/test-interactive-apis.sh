#!/bin/bash

# Test script for interactive API endpoints
# Usage: ./scripts/test-interactive-apis.sh

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Interactive API Endpoints"
echo "===================================="
echo ""

# Test 1: Page Views - GET
echo "📊 Test 1: GET /api/pageviews"
curl -s "${BASE_URL}/pageviews" | jq '.'
echo ""
echo ""

# Test 2: Page Views - POST (increment)
echo "📊 Test 2: POST /api/pageviews (increment)"
curl -s -X POST "${BASE_URL}/pageviews" | jq '.'
echo ""
echo ""

# Test 3: Mood - GET statistics
echo "😊 Test 3: GET /api/mood (statistics)"
curl -s "${BASE_URL}/mood" | jq '.'
echo ""
echo ""

# Test 4: Mood - POST vote
echo "😊 Test 4: POST /api/mood (vote)"
curl -s -X POST "${BASE_URL}/mood" \
  -H "Content-Type: application/json" \
  -d '{"mood": "happy"}' | jq '.'
echo ""
echo ""

# Test 5: Guestbook - GET messages
echo "📝 Test 5: GET /api/guestbook"
curl -s "${BASE_URL}/guestbook" | jq '.'
echo ""
echo ""

# Test 6: Guestbook - POST message
echo "📝 Test 6: POST /api/guestbook"
curl -s -X POST "${BASE_URL}/guestbook" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message from script!", "emoji": "🚀"}' | jq '.'
echo ""
echo ""

# Test 7: Mood - POST invalid mood (should fail)
echo "❌ Test 7: POST /api/mood (invalid mood - should fail)"
curl -s -X POST "${BASE_URL}/mood" \
  -H "Content-Type: application/json" \
  -d '{"mood": "invalid"}' | jq '.'
echo ""
echo ""

# Test 8: Guestbook - POST empty message (should fail)
echo "❌ Test 8: POST /api/guestbook (empty message - should fail)"
curl -s -X POST "${BASE_URL}/guestbook" \
  -H "Content-Type: application/json" \
  -d '{"message": "   "}' | jq '.'
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "Note: Rate limiting tests require waiting:"
echo "  - Guestbook: 5 minutes between posts"
echo "  - Mood: 24 hours between votes"
