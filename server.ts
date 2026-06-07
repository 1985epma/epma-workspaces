/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini Client safely on the server
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI client successfully initialized.');
  } else {
    console.warn('Warning: GEMINI_API_KEY environment variable is missing or placeholder. AI features will require custom key configuration.');
  }
} catch (error) {
  console.error('Failed to initialize Gemini Client:', error);
}

// API Routes
app.post('/api/stripe/payment-intent', async (req, res) => {
  try {
    const { plan, cycle, email, paymentMethod, price } = req.body;

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret || stripeSecret === 'MY_STRIPE_SECRET_KEY') {
      // Gracefully fall back to simulated developer sandbox if credential is set to raw placeholder or omitted.
      return res.json({
        success: true,
        sandbox: true,
        message: 'Proceeding in developer sandboxed mode. Specify STRIPE_SECRET_KEY to trigger actual stripe records.',
        clientSecret: 'pi_stripe_mock_secret_' + Math.random().toString(36).substring(2, 10),
      });
    }

    // Lazy load and initialize stripe client instance
    const StripeModule = await import('stripe');
    const stripe = new StripeModule.default(stripeSecret, {
      apiVersion: '2023-10-16' as any,
    });

    const amountInCents = Math.max(50, Math.round(price * 100)); // Minimum 50 cents charge on Stripe
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      receipt_email: email,
      metadata: {
        plan,
        cycle,
        customer_email: email,
        payment_gateway: paymentMethod,
      },
    });

    res.json({
      success: true,
      sandbox: false,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });

  } catch (error: any) {
    console.error('Stripe payment intent creation failure:', error);
    res.status(500).json({ error: error.message || 'Error executing request against Stripe services.' });
  }
});

app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (!ai) {
      // Lazy attempt to initialize if variable changes
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } else {
        return res.status(503).json({
          error: 'Gemini AI services are currently unavailable. Please configure GEMINI_API_KEY in the Secrets panel.',
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || 'You are an intelligent, concise editor assistant integrated into an EPMA page editor.',
        temperature: 0.7,
      },
    });

    res.json({ result: response.text || '' });
  } catch (error: any) {
    console.error('Gemini API execution error:', error);
    res.status(500).json({ error: error.message || 'Error occurred while contacting Gemini services.' });
  }
});

// Configure Vite middleware or static serving
async function configureServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EPMA Workspace server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

configureServer();
