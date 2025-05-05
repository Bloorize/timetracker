# Time Tracker Application

A comprehensive time tracking application that allows you to manage projects and tasks, track time spent on each task, and generate reports.

## Features

- User authentication with Supabase
- Project management
- Task tracking with timer functionality
- Time reporting with charts
- Data persistence in Supabase
- Calendar-based time entry for retroactive time tracking

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account and project

## Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Set up the following tables in your Supabase database:

### `profiles` table
- `id` (uuid, primary key, references auth.users.id)
- `updated_at` (timestamp with time zone)
- `username` (text)
- `full_name` (text)
- `avatar_url` (text)

### `projects` table
- `id` (uuid, primary key, generated as identity)
- `created_at` (timestamp with time zone, default: now())
- `name` (text, not null)
- `description` (text)
- `user_id` (uuid, not null, references auth.users.id)

### `tasks` table
- `id` (uuid, primary key, generated as identity)
- `created_at` (timestamp with time zone, default: now())
- `name` (text, not null)
- `time_spent` (integer, default: 0)
- `project_id` (uuid, not null, references projects.id)

### `active_tasks` table
- `id` (uuid, primary key, generated as identity)
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())
- `user_id` (uuid, not null, references auth.users.id)
- `task_id` (uuid, not null, references tasks.id)
- `project_id` (uuid, not null, references projects.id)
- `start_time` (bigint, not null)

3. Set up Row Level Security (RLS) policies for each table to ensure users can only access their own data.

## Installation

1. Clone the repository:
```
git clone https://github.com/your-username/time-tracker.git
cd time-tracker
```

2. Install dependencies:
```
npm install
```

3. Set up your Supabase credentials using the setup script:
```
npm run setup
```
This will create a `.env.local` file in the root directory.

4. Edit the `.env.local` file with your actual Supabase credentials:
```
REACT_APP_SUPABASE_URL=your_actual_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

## Running the Application

1. Start the development server:
```
npm start
```

2. Open your browser and navigate to `http://localhost:3000`

## Building for Production

### Local Build

To create a production build locally:

```
npm run build
```

This will create an optimized build in the `build` folder that you can deploy to your hosting provider.

### Deployment Options

#### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)

1. Create a production build:
   ```
   npm run build
   ```

2. Deploy to your preferred hosting platform:
   - **Netlify**: Connect your GitHub repository or upload the build folder
   - **Vercel**: Connect your GitHub repository
   - **GitHub Pages**: Deploy the build folder using gh-pages package

#### Option 2: Docker Deployment

1. Create a Dockerfile in the root directory:
   ```
   FROM node:16-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Build and run the Docker image:
   ```
   docker build -t time-tracker .
   docker run -p 80:80 time-tracker
   ```

### Environment Variables

For production deployment, make sure your hosting platform has these environment variables set:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Optimization Tips

1. Remove console.log statements in production
2. Enable gzip compression on your server
3. Use CDN for static assets
4. Consider code splitting for larger components

## Technologies Used

- React
- Supabase (Authentication and Database)
- Recharts (Data visualization)
- CSS for styling

## License

MIT

## Calendar Time Entry Feature

The calendar time entry feature allows users to:

1. Log time for tasks on past dates when they may have forgotten to track time
2. Select a specific date from a calendar interface
3. Enter the exact amount of time spent on a task for that date

To use this feature:

1. Navigate to any task in a project
2. Click the calendar icon (📅) next to the task's time display
3. Select a date from the calendar
4. Enter the time spent on that task for the selected date
5. Click "Save Time" to record the entry

This feature is particularly useful for:
- Backfilling time tracking data
- Correcting time entries for previous work days
- Ensuring accurate time reports across different dates
