# API Setup Guide

This app needs to connect to a multimodal LLM API. Here are the options and setup instructions:

## Option 1: OpenAI GPT-4 Vision

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. In `App.jsx`, update the fetch call:

```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_OPENAI_API_KEY`
  },
  body: JSON.stringify({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Based on this image, create a detailed fursona description. Include: species, colors, personality traits, unique features, and a creative backstory. Make it fun and engaging!'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 1000
  })
})

const data = await response.json()
setResult(data.choices[0].message.content)
```

## Option 2: Anthropic Claude

1. Get an API key from [Anthropic](https://console.anthropic.com/)
2. In `App.jsx`, update the fetch call:

```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_ANTHROPIC_API_KEY',
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image
            }
          },
          {
            type: 'text',
            text: 'Based on this image, create a detailed fursona description. Include: species, colors, personality traits, unique features, and a creative backstory. Make it fun and engaging!'
          }
        ]
      }
    ]
  })
})

const data = await response.json()
setResult(data.content[0].text)
```

## Option 3: Google Gemini

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. In `App.jsx`, update the fetch call:

```javascript
const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=YOUR_GOOGLE_API_KEY`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: 'Based on this image, create a detailed fursona description. Include: species, colors, personality traits, unique features, and a creative backstory. Make it fun and engaging!'
          },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }
    ]
  })
})

const data = await response.json()
setResult(data.candidates[0].content.parts[0].text)
```

## Important Security Note

⚠️ **Never commit API keys to version control!**

### Recommended: Use Environment Variables

1. Create a `.env` file in the frontend directory:
```
VITE_API_KEY=your_api_key_here
VITE_API_PROVIDER=openai
```

2. Add `.env` to your `.gitignore`

3. In your code, use:
```javascript
const API_KEY = import.meta.env.VITE_API_KEY
const API_PROVIDER = import.meta.env.VITE_API_PROVIDER
```

### Even Better: Use a Backend

For production, create a backend API that:
1. Keeps your API keys secret
2. Handles rate limiting
3. Adds authentication
4. Manages costs

Example backend endpoint structure:
```
POST /api/generate-fursona
Body: { image: base64String }
Response: { description: string }
```

## Testing Without API

For testing the UI without an API, you can mock the response:

```javascript
const handleGenerate = async () => {
  setLoading(true)
  
  // Mock response for testing
  setTimeout(() => {
    setResult(`🦊 **Species:** Red Fox

**Colors:** Vibrant orange-red fur with white underbelly and black paw tips

**Personality:** Playful and curious, with a mischievous streak. Loves adventures and making new friends!

**Special Features:** 
- Bushy tail with white tip that glows softly in moonlight
- Bright amber eyes that sparkle when excited
- A small tuff of purple-tinted fur behind the left ear

**Backstory:** Born in the mystical Whispering Woods, this fox discovered their magical tail glow during a midnight exploration. Now they use it to guide lost travelers and create beautiful light shows for forest gatherings.`)
    setLoading(false)
  }, 2000)
}
```
