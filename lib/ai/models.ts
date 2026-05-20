import { google } from '@ai-sdk/google';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  isFree: boolean;
  model: ReturnType<typeof google>;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    provider: 'Google',
    description: 'Model terbaru yang sangat cerdas, responsif, dan kaya fitur',
    isFree: true,
    model: google('models/gemini-3.5-flash'),
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Model cepat berkinerja tinggi, cocok untuk respons cepat',
    isFree: true,
    model: google('models/gemini-2.5-flash'),
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'Model penalaran tingkat tinggi, cocok untuk tugas kompleks',
    isFree: true,
    model: google('models/gemini-2.5-pro'),
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Model cepat dengan latensi yang sangat rendah',
    isFree: true,
    model: google('models/gemini-2.0-flash'),
  },
];

export function getModelById(modelId: string): AIModel | undefined {
  return AI_MODELS.find((model) => model.id === modelId);
}

export function getFreeModels(): AIModel[] {
  return AI_MODELS.filter((model) => model.isFree);
}

export function getDefaultModel(): AIModel {
  return AI_MODELS[0];
}
