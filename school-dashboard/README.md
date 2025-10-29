# School Dashboard - Dugsi Management System

A modern school management dashboard built with Next.js, Supabase, and Tailwind CSS.

## Features

- Dashboard analytics
- Student management
- Parent management
- Class management
- Finance tracking
- Payment processing

## Tech Stack

- **Framework**: Next.js 15
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- DigitalOcean account (for deployment)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/sidowxyz/machad-darul-waxyi.git
cd machad-darul-waxyi/school-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to DigitalOcean App Platform

### Option 1: Deploy via DigitalOcean Console

1. Log in to your [DigitalOcean account](https://cloud.digitalocean.com)

2. Go to **App Platform** → **Create App**

3. Connect your GitHub repository:
   - Select GitHub and authorize DigitalOcean
   - Choose the repository: `sidowxyz/machad-darul-waxyi`
   - Select the branch: `master`

4. Configure the app:
   - **Source Directory**: `school-dashboard`
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
   - **Environment**: Node.js
   - **Node Version**: 20.x

5. Add environment variables:
   - Click on **Environment Variables** section
   - Add the following:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

6. Configure the plan:
   - Choose a Basic plan (starts at $5/month)
   - Select your preferred region

7. Review and create your app

8. Deploy!

### Option 2: Deploy via DigitalOcean CLI (doctl)

1. Install DigitalOcean CLI:
```bash
# Windows (with Chocolatey)
choco install doctl

# Or download from: https://github.com/digitalocean/doctl/releases
```

2. Authenticate:
```bash
doctl auth init
```

3. Create an app spec file (already created in this repo)

4. Deploy:
```bash
doctl apps create --spec .do/app.yaml
```

### Database Setup

Before deploying, make sure to:

1. Set up your Supabase database schema by running the SQL files:
   - `admin-setup.sql`
   - `database-schema.sql`

2. Create an admin user by running the setup script or manually inserting into the admins table.

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
school-dashboard/
├── app/              # Next.js app directory
│   ├── dashboard/   # Dashboard pages
│   ├── students/    # Student management
│   ├── parents/     # Parent management
│   ├── classes/     # Class management
│   └── finance/     # Finance management
├── components/       # React components
├── lib/             # Utility functions and API
├── public/          # Static assets
└── middleware.ts    # Next.js middleware
```

## License

Private - All rights reserved
