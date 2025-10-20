// Security utilities for user input validation

export function sanitizeMessage(message: string): string {
  // Remove HTML tags
  message = message.replace(/<[^>]*>/g, '')
  
  // Remove script tags and their content
  message = message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Escape special characters
  message = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
  
  return message.trim()
}

export function validateMessage(message: string): { valid: boolean; error?: string } {
  // Length check
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }
  
  if (message.length > 500) {
    return { valid: false, error: 'Message is too long (max 500 characters)' }
  }
  
  // Check for URLs
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9]+\.(com|net|org|io|dev))/gi
  if (urlPattern.test(message)) {
    return { valid: false, error: 'URLs are not allowed' }
  }
  
  // Check for excessive special characters (more than 20% of message)
  const specialChars = message.match(/[^a-zA-Z0-9\s.,!?'"]/g) || []
  if (specialChars.length / message.length > 0.2) {
    return { valid: false, error: 'Too many special characters' }
  }
  
  // Check for repeating characters (more than 5 in a row)
  if (/(.)\1{5,}/.test(message)) {
    return { valid: false, error: 'Please avoid repeating characters' }
  }
  
  // Check for common spam patterns
  const spamPatterns = [
    /click here/gi,
    /buy now/gi,
    /limited time/gi,
    /act now/gi,
    /free money/gi,
  ]
  
  for (const pattern of spamPatterns) {
    if (pattern.test(message)) {
      return { valid: false, error: 'Message contains spam-like content' }
    }
  }
  
  return { valid: true }
}

export function containsProfanity(message: string): boolean {
  // Basic profanity filter - you can expand this list
  const profanityList = [
    'badword1', 'badword2', // Replace with actual words
    // Add more words as needed
  ]
  
  const lowerMessage = message.toLowerCase()
  
  for (const word of profanityList) {
    if (lowerMessage.includes(word)) {
      return true
    }
  }
  
  return false
}
