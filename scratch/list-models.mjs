import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

async function listModels() {
  console.log('Fetching available models from Google API...');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log('Available Models:');
      data.models.forEach((m) => {
        console.log(`- Name: ${m.name}`);
        console.log(`  Display Name: ${m.displayName}`);
        console.log(`  Supported Methods: ${m.supportedGenerationMethods.join(', ')}`);
      });
    } else {
      console.log('No models returned:', data);
    }
  } catch (err) {
    console.error('Error fetching models:', err);
  }
}

listModels();
