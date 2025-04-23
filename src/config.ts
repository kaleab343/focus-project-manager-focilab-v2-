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

interface Config {
  OPENAI_API_KEY: string;
}

const getConfig = (): Config => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('VITE_OPENAI_API_KEY is not set in environment variables');
  }

  return { OPENAI_API_KEY };
};

export default getConfig();
