// Environment variables for the browser
export const config = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  }
};

// Validate required environment variables
export function validateConfig() {
  if (!config.openai.apiKey) {
    throw new Error('VITE_OPENAI_API_KEY is not set in environment variables');
  }
} 