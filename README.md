# School Management Dashboard

A comprehensive school management system built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Student Management**: Register students, assign to classes, manage status (active/inactive)
- **Parent Management**: Register and manage parent information and contact details
- **Class Management**: Create and organize classes for better student organization
- **Finance Reports**: Track monthly income, fees, discounts, and generate financial reports
- **Dashboard Overview**: Get a comprehensive view of key metrics and statistics
- **Real-time Updates**: All data is synchronized in real-time using Supabase
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Data**: Mock data (ready for Supabase integration)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd school-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Current Status

The application is currently running with **mock data** for design and UI development. All CRUD operations work with in-memory data storage.

### Future: Supabase Integration

When you're ready to connect to a real database:

1. **Set up Supabase:**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Go to Project Settings > API
   - Copy your Project URL and anon key

2. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

3. **Set up the database:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database-schema.sql`
   - Run the SQL to create all necessary tables, views, and functions

4. **Update the code:**
   - Replace `mockApi` imports with `supabase` imports in all page files
   - Update API calls to use Supabase queries instead of mock functions

## Database Schema

The system includes the following tables:

- **parents**: Store parent information (name, phone, address)
- **classes**: Store class information (name, description)
- **students**: Store student information (name, parent_id, class_id, fee, discount, status)

Additional features:
- **monthly_income_by_class**: A view that calculates income by class
- **get_dashboard_stats()**: A function that returns dashboard statistics

## Pages

- **/** - Landing page with feature overview
- **/dashboard** - Main dashboard with statistics and quick actions
- **/parents** - Parent management (add, edit, delete, search)
- **/students** - Student management (add, edit, delete, status toggle)
- **/classes** - Class management (add, edit, delete)
- **/finance** - Financial reports and income analysis

## Key Features

### Student Management
- Register new students with parent and class assignment
- Set monthly fees and discounts
- Toggle student status (active/inactive)
- Search and filter students
- Edit student information

### Parent Management
- Register parent contact information
- Link students to parents
- Search and manage parent records

### Class Management
- Create and organize classes
- Assign students to classes
- Manage class descriptions

### Finance Reports
- Monthly income by class
- Total income calculations
- Discount tracking
- Financial insights and metrics
- Visual percentage breakdowns

### Dashboard
- Real-time statistics
- Quick action buttons
- System status overview
- Key metrics at a glance

## Development

### Project Structure
```
school-dashboard/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── parents/           # Parent management
│   ├── students/          # Student management
│   ├── classes/           # Class management
│   └── finance/           # Finance reports
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── database-schema.sql   # Database setup script
```

### Adding New Features

1. **Database**: Add new tables/columns in Supabase
2. **Types**: Update `lib/types.ts` with new TypeScript interfaces
3. **Components**: Create new UI components in `components/`
4. **Pages**: Add new pages in the `app/` directory
5. **API**: Use Supabase client for data operations

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments

---

Built with ❤️ using Next.js, TypeScript, and Supabase