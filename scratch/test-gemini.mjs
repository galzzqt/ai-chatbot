import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Ensure API key is set in environment
process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

const modelsToTest = [
  'models/gemini-1.5-flash',
  'gemini-1.5-flash',
  'models/gemini-2.5-flash',
  'gemini-2.5-flash',
  'models/gemini-1.5-pro',
  'gemini-1.5-pro',
  'models/gemini-1.5-flash-8b',
  'gemini-1.5-flash-8b'
];

async function testModels() {
  console.log('Testing model identifiers...');
  console.log('API Key configured:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  for (const modelId of modelsToTest) {
    try {
      console.log(`\nTesting "${modelId}"...`);
      const { text } = await generateText({
        model: google(modelId),
        prompt: 'Hi, quick test.',
      });
      console.log(`✓ Success: ${text.trim()}`);
    } catch (err) {
      console.log(`✗ Failed: ${err.message}`);
    }
  }
}

testModels();
