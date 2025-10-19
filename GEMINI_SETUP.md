# 🤖 Google Gemini API Setup Guide

## 🎯 Why Gemini?

Google Gemini 1.5 Flash is now the default AI provider for the Fursona Generator because:

✅ **Free tier with generous limits** - 15 requests per minute, 1 million tokens per day  
✅ **Fast responses** - Optimized for speed  
✅ **Multimodal** - Native image understanding  
✅ **High quality** - Excellent creative output  
✅ **Easy to use** - Simple API, no complex setup  

## 🔑 Get Your Gemini API Key

### Step 1: Visit Google AI Studio

Go to: **https://aistudio.google.com/app/apikey**

### Step 2: Get API Key

1. Click **"Get API key"** or **"Create API key"**
2. Select or create a Google Cloud project
3. Click **"Create API key in new project"** (or use existing)
4. **Copy the API key** (starts with `AIza...`)

### Step 3: Add to Your Environment

**For Docker (Recommended):**

Edit `.env` in the root folder:
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

**For Local Development:**

Edit `backend/.env`:
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

## 🚀 Quick Start

### Option 1: With Docker

```bash
# Edit .env with your Gemini API key
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...

# Start
docker-compose up -d
```

### Option 2: Local Development

```bash
# Edit backend/.env
cd backend
# Add GEMINI_API_KEY=AIzaSy...

# Start backend
npm run dev

# In another terminal
cd frontend
npm run dev
```

## 📊 Gemini vs OpenAI

| Feature | Gemini 1.5 Flash | GPT-4 Vision |
|---------|------------------|--------------|
| **Cost** | Free tier | Paid only |
| **Speed** | Very Fast | Moderate |
| **Free Quota** | 15 RPM / 1M tokens/day | None |
| **Image Support** | ✅ Native | ✅ Native |
| **Quality** | Excellent | Excellent |
| **Setup** | Simple | Requires billing |

## 🔧 Configuration Options

### Use Gemini (Default)

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
```

### Switch to OpenAI

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

## 📝 API Details

### Model Used
- **gemini-1.5-flash** - Fast and efficient multimodal model

### Endpoint
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

### Parameters
```javascript
{
  temperature: 0.9,      // Creativity level
  topK: 40,              // Top-K sampling
  topP: 0.95,            // Nucleus sampling
  maxOutputTokens: 1024  // Max response length
}
```

## 🎨 Example Request

```javascript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY

{
  "contents": [
    {
      "parts": [
        {
          "text": "Create a fursona from this image..."
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "base64_encoded_image"
          }
        }
      ]
    }
  ]
}
```

## 📊 Rate Limits (Free Tier)

| Metric | Limit |
|--------|-------|
| Requests per minute | 15 |
| Requests per day | 1,500 |
| Tokens per minute | 1 million |
| Tokens per day | 1 million |

**Note:** These are generous limits! At 15 requests per minute, you can handle 900 generations per hour.

## 💰 Pricing

### Free Tier
- ✅ 15 requests per minute
- ✅ 1 million tokens per day
- ✅ No credit card required
- ✅ Perfect for development and small apps

### Paid Tier (if you exceed free limits)
- **Input**: $0.035 per 1M tokens
- **Output**: $0.14 per 1M tokens
- Still very affordable!

Compare to OpenAI GPT-4 Vision:
- Input: $10 per 1M tokens
- Output: $30 per 1M tokens

**Gemini is ~100x cheaper!** 💰

## 🔒 Security Best Practices

### ✅ Do:
- Store API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables
- Rotate keys periodically

### ❌ Don't:
- Commit API keys to git
- Share API keys publicly
- Use in client-side code
- Hardcode in source files

## 🐛 Troubleshooting

### Error: "API key not valid"

**Solution:** 
1. Check your API key in Google AI Studio
2. Make sure it's correctly copied (no extra spaces)
3. Verify it's set in `.env` as `GEMINI_API_KEY`

### Error: "Resource has been exhausted"

**Solution:** You've hit rate limits.
- Free tier: 15 requests per minute
- Wait a minute and try again
- Consider upgrading to paid tier

### Error: "GEMINI_API_KEY not configured"

**Solution:**
1. Make sure `.env` file exists
2. Check `GEMINI_API_KEY` is set
3. Restart the backend server
4. For Docker, run `docker-compose down && docker-compose up -d`

### No response or empty result

**Solution:**
1. Check image is properly base64 encoded
2. Verify image size is reasonable (< 4MB)
3. Check backend logs: `docker-compose logs backend`

## 🎓 API Documentation

**Official Gemini API Docs:**
https://ai.google.dev/docs

**Get API Key:**
https://aistudio.google.com/app/apikey

**Pricing:**
https://ai.google.dev/pricing

## 🔄 Migration from OpenAI

Already using OpenAI? Switching is easy!

### Step 1: Get Gemini API Key
Visit: https://aistudio.google.com/app/apikey

### Step 2: Update .env
```env
# Change this
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...

# To this
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
```

### Step 3: Restart
```bash
docker-compose down
docker-compose up -d
```

Done! Your app now uses Gemini. 🎉

## ✅ Checklist

Before starting:
- [ ] Got Gemini API key from https://aistudio.google.com/app/apikey
- [ ] Added `GEMINI_API_KEY` to `.env`
- [ ] Set `LLM_PROVIDER=gemini`
- [ ] Saved `.env` file
- [ ] Restarted backend (or docker-compose)

## 🎉 You're Ready!

Your app now uses Google Gemini for AI-powered fursona generation!

**Benefits:**
- 🆓 Free tier with generous limits
- ⚡ Fast response times
- 🎨 High-quality creative output
- 💰 Cost-effective at scale

Enjoy generating fursonas with Gemini! 🚀

---

**Need help?** Check the main README.md or open an issue on GitHub.
