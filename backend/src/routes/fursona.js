import express from 'express';
import axios from 'axios';
import db from '../db/database.js';
import { authenticateToken, checkSubscriptionLimit } from '../middleware/auth.js';

const router = express.Router();

// Generate fursona
router.post('/generate', authenticateToken, checkSubscriptionLimit, async (req, res) => {
  try {
    const { image } = req.body; // base64 encoded image

    if (!image) {
      return res.status(400).json({ error: 'Image required' });
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    let description;

    // Call LLM API based on provider
    const provider = process.env.LLM_PROVIDER || 'openai';

    if (provider === 'openai') {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Based on this image, create a detailed fursona description. Include: species, colors, personality traits, unique features, and a creative backstory. Make it fun and engaging! Format it nicely with markdown.'
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

    // Save to database
    const [result] = await db.query(
      'INSERT INTO fursonas (user_id, description) VALUES (?, ?)',
      [req.user.id, description]
    );

    // Update generation count
    await db.query(
      'UPDATE subscriptions SET generations_used = generations_used + 1 WHERE user_id = ?',
      [req.user.id]
    );

    // Get updated subscription info
    const [subscriptions] = await db.query(
      'SELECT generations_used, generations_limit, plan_type FROM subscriptions WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      id: result.insertId,
      description,
      subscription: subscriptions[0]
    });
  } catch (error) {
    console.error('Fursona generation error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate fursona',
      details: error.response?.data?.error || error.message
    });
  }
});

// Get user's fursonas
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const [fursonas] = await db.query(
      'SELECT id, description, created_at FROM fursonas WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    res.json({ fursonas });
  } catch (error) {
    console.error('Get fursonas error:', error);
    res.status(500).json({ error: 'Failed to get fursonas' });
  }
});

// Get single fursona
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [fursonas] = await db.query(
      'SELECT * FROM fursonas WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (fursonas.length === 0) {
      return res.status(404).json({ error: 'Fursona not found' });
    }

    res.json({ fursona: fursonas[0] });
  } catch (error) {
    console.error('Get fursona error:', error);
    res.status(500).json({ error: 'Failed to get fursona' });
  }
});

export default router;
