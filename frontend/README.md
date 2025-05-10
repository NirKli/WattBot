# WattBot Frontend

A modern, responsive frontend for the WattBot electricity meter OCR application. Built with React, TypeScript, and Tailwind CSS.

## Features

- Upload and process electricity meter images
- View OCR-detected readings
- Browse consumption history
- View detailed information for each reading
- Responsive design inspired by TeslaMate

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Running WattBot backend server (default: http://localhost:8000)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Development

- The application uses TypeScript for type safety
- Tailwind CSS is used for styling
- Axios is used for API communication
- React hooks are used for state management

## Project Structure

- `src/components/` - React components
  - `ImageUpload.tsx` - Image upload and OCR processing
  - `ConsumptionHistory.tsx` - Consumption history table
  - `LatestReading.tsx` - Latest reading card
- `src/App.tsx` - Main application component
- `src/index.css` - Global styles and Tailwind imports

## API Integration

The frontend communicates with the following backend endpoints:

- `POST /monthly-consumption` - Upload and process new image
- `GET /monthly-consumption` - Get all readings
- `GET /monthly-consumption/{id}` - Get specific reading
- `GET /monthly-consumption/file/{id}` - Get reading image
