import express from 'express';
import axios from 'axios';

const router = express.Router();

// Generate fursona (no auth required)
router.post('/generate', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image required' });
    }

    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
    const provider = process.env.LLM_PROVIDER || 'gemini';
    const systemPrompt = process.env.GEMINI_SYSTEM_PROMPT || 
      'Based on this image, create a detailed fursona description. Include: species, colors, personality traits, unique features, and a creative backstory. Make it fun and engaging!';

    let description;

    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [
              { text: systemPrompt },
              { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
            ]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      description = response.data.candidates[0].content.parts[0].text;
      
    } else if (provider === 'openai') {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
          }],
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );

      description = response.data.choices[0].message.content;
    } else {
      throw new Error(`Unsupported LLM provider: ${provider}`);
    }

    res.json({ description });
  } catch (error) {
    console.error('Fursona generation error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate fursona',
      details: error.response?.data?.error || error.message
    });
  }
});

export default router;
