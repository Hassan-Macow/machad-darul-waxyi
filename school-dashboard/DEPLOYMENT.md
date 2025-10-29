# DigitalOcean Deployment Guide

This guide will walk you through deploying the School Dashboard to DigitalOcean App Platform.

## Prerequisites

1. A DigitalOcean account ([Sign up here](https://www.digitalocean.com))
2. Your Supabase credentials
3. Your code pushed to GitHub

## Step-by-Step Deployment Instructions

### 1. Prepare Your Environment Variables

You'll need these values from your Supabase project:
- **NEXT_PUBLIC_SUPABASE_URL**: Found in Supabase Dashboard → Project Settings → API
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Found in Supabase Dashboard → Project Settings → API

### 2. Deploy via DigitalOcean Console (Recommended)

#### Step 1: Access App Platform
1. Log in to [DigitalOcean](https://cloud.digitalocean.com)
2. Click on **App Platform** in the left sidebar
3. Click **Create App**

#### Step 2: Connect Your Repository
1. Under **Source**, select **GitHub**
2. Click **Sign in with GitHub** if not already connected
3. Search for and select the repository: `machad-darul-waxyi`
4. Select the branch: `master`
5. Click **Next**

#### Step 3: Configure Your App
1. **Source Directory**: Enter `school-dashboard`
2. **Build Command**: `npm run build`
3. **Run Command**: `npm start`
4. Click **Skip Buildpack Detection** or let it auto-detect (should be Node.js)
5. Click **Edit** on the web service to configure:
   - **Type**: Web Service
   - **HTTP Port**: 8080
   - **Instance Count**: 1 (Basic plan)
   - **Instance Size**: Basic ($5/month)

#### Step 4: Add Environment Variables
1. Scroll down to the **Environment Variables** section
2. Click **Add Variable** twice to add both variables:
   - Variable 1:
     - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: Your Supabase project URL (from Step 1)
   - Variable 2:
     - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value**: Your Supabase anon key (from Step 1)
3. Click **Next**

#### Step 5: Choose Your Plan
1. Select **Basic** plan ($5/month)
2. Leave other settings as default
3. Click **Next**

#### Step 6: Review and Create
1. Review your configuration
2. Click **Create Resources**

#### Step 7: Wait for Deployment
- DigitalOcean will build and deploy your app
- This typically takes 5-10 minutes
- You can watch the progress in the console
- Once complete, you'll get a URL like `your-app-abc123.ondigitalocean.app`

### 3. Verify Your Deployment

1. Once deployment is complete, click on your app
2. Click on the provided URL to open your dashboard
3. Test that the application loads correctly
4. Log in with your admin credentials

### 4. Set Up Your Database (If Not Done)

If you haven't set up your Supabase database yet:

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the contents of `admin-setup.sql`
4. Run the contents of `database-schema.sql`
5. Create your first admin user

### 5. Custom Domain (Optional)

To add a custom domain:

1. In your DigitalOcean app settings, go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `dashboard.yourschool.com`)
4. Add the DNS records provided by DigitalOcean to your domain registrar
5. Wait for DNS propagation (can take up to 48 hours)

### 6. Enable Auto-Deploy

Your app is already configured for auto-deploy:
- Every push to the `master` branch will trigger a new deployment
- You can view deployment history in the DigitalOcean console

## Troubleshooting

### Build Fails
- Check the build logs in DigitalOcean console
- Ensure all dependencies are in `package.json`
- Verify your build command is correct

### App Doesn't Load
- Check the runtime logs in DigitalOcean console
- Verify environment variables are set correctly
- Check that your Supabase credentials are valid

### Database Connection Issues
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is active
- Ensure your database schema is properly set up

### Environment Variables Not Working
- Restart your app after adding new environment variables
- Check that variable names match exactly (case-sensitive)
- Verify you saved the variables in App Platform settings

## Monitoring and Logs

1. **View Logs**: DigitalOcean Console → Your App → Runtime Logs
2. **Metrics**: Monitor CPU, memory, and HTTP metrics
3. **Alerts**: Set up alerts for critical errors

## Scaling Your App

To scale your application:

1. Go to your app in DigitalOcean console
2. Click on your web service
3. Adjust **Instance Count** or **Instance Size**
4. Click **Save**

## Cost Estimation

- **Basic Plan**: $5/month (1 instance, 512 MB RAM)
- **Professional Plan**: $12/month (2 instances, 1 GB RAM)
- **Bandwidth**: First 100 GB/month included, then $0.01/GB

## Support

For issues with:
- **DigitalOcean**: Check [DO Documentation](https://www.digitalocean.com/docs/app-platform/)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)


