# Deployment Guide for Time Tracker

This guide will help you deploy your Time Tracker application to various environments.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account with properly configured tables

## Environment Setup

Before deploying, make sure you have the correct environment variables:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
GENERATE_SOURCEMAP=false
```

## Deployment Options

### 1. Static Hosting (Recommended)

#### Netlify

1. Push your code to GitHub
2. Log in to Netlify and create a new site from Git
3. Select your repository
4. Use these build settings:
   - Build command: `npm run build:prod`
   - Publish directory: `build`
5. Add your environment variables in Netlify's settings
6. Deploy!

#### Vercel

1. Push your code to GitHub
2. Log in to Vercel and create a new project
3. Select your repository
4. Use these build settings:
   - Framework preset: Create React App
   - Build command: `npm run build:prod`
   - Output directory: `build`
5. Add your environment variables in Vercel's settings
6. Deploy!

### 2. Manual Deployment

1. Run the production build:
   ```
   npm run build:prod
   ```

2. Upload the entire `build` directory to your hosting provider
   - For Apache, make sure `.htaccess` is configured for SPA routing
   - For Nginx, use the configuration provided in the Dockerfile

### 3. Docker Deployment

1. Build the Docker image:
   ```
   docker build -t time-tracker .
   ```

2. Run the container:
   ```
   docker run -p 80:80 time-tracker
   ```

3. For cloud deployment (AWS, GCP, Azure), push your image to a container registry:
   ```
   docker tag time-tracker:latest your-registry/time-tracker:latest
   docker push your-registry/time-tracker:latest
   ```

## Testing Your Production Build

To test your production build locally:

```
npm run serve
```

This will build the app and serve it on http://localhost:5000

## Common Issues and Troubleshooting

### Authentication Issues

- **Problem**: Authentication not working in production
- **Solution**: Make sure your Supabase URL and Anon Key are correctly set

### Routing Issues

- **Problem**: Getting 404 when refreshing pages
- **Solution**: Configure your server for SPA routing (see netlify.toml or Dockerfile)

### Environment Variable Issues

- **Problem**: Environment variables not being picked up
- **Solution**: Ensure they're prefixed with REACT_APP_ and rebuild 