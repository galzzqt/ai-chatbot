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
  'models/gemini-3.5-flash',
  'models/gemini-2.5-pro',
  'models/gemini-2.5-flash',
  'models/gemini-2.0-flash'
];

async function testModels() {
  console.log('Testing specific models...');
  for (const modelId of modelsToTest) {
    try {
      console.log(`\nTesting "${modelId}"...`);
      const { text } = await generateText({
        model: google(modelId),
        prompt: 'Hi, quick test.',
      });
      console.log(`✓ Success: ${text.trim().substring(0, 100)}`);
    } catch (err) {
      console.log(`✗ Failed: ${err.message}`);
    }
  }
}

testModels();
