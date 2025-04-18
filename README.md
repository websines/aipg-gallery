# AI Image Gallery

A modern web application for AI image generation and gallery browsing built with Next.js.

## Features

- **Multi-Image Generation**: Generate multiple AI images without page refresh
- **Image History**: Track and browse your previously generated images
- **Modern UI**: Sleek design with gradient backgrounds and responsive layout
- **Image Gallery**: Browse and search through AI-generated images
- **User Authentication**: Secure login and user-specific image collections

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **State Management**: React Query for server state
- **Authentication**: Supabase Auth
- **APIs**: AI Image Generation API

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Components

### Image Generation

The image generation functionality has been modernized to:
- Allow multiple image generations without page refresh
- Track generation history
- Provide better error handling and user feedback
- Support downloading of generated images

### UI Improvements

- Modern gradient backgrounds
- Responsive design for all screen sizes
- Improved typography and layout
- Enhanced image carousel for viewing generated images

## Project Structure

- `/app`: Next.js app router pages and API functions
- `/components`: React components organized by feature
- `/types`: TypeScript type definitions
- `/public`: Static assets

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_API_URL=your_api_url
```

## License

MIT