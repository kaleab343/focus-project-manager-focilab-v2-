# Focilab

A modern React application built with TypeScript, Tailwind CSS v4, and React Router DOM.

## Features

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS v4 for styling
  - Using the new `@layer` directive for component organization
  - Using standard CSS properties instead of `@apply` directives
  - Configured with the new `darkMode: 'selector'` option
  - Using the official `@tailwindcss/postcss` plugin
- React Router DOM for routing

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd focilab
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code quality issues
- `npm run preview` - Preview the production build locally

## Project Structure

```
focilab/
├── public/            # Static assets
├── src/               # Source code
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # Reusable components
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles with Tailwind directives
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
├── postcss.config.js  # PostCSS configuration
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## License

MIT
