# Instagram Clone

This is a full-featured Instagram clone built with Next.js 15 and Supabase, featuring real-time updates and responsive design.

## Features

- **Authentication System**
  - User registration and login
  - Protected routes

- **User Profiles**
  - Customizable profile pictures
  - Editable bio and personal information
  - Follow/unfollow functionality with optimistic UI updates
  - Profile statistics (posts, followers, following)

- **Posts and Media**
  - Image upload and posting with captions
  - Feed showing posts from all users
  - Individual post pages with expanded view
  - Like functionality with double-tap support
  - Real-time like counter updates

- **Comments System**
  - Add comments to posts
  - View all comments on a post
  - Real-time comment updates

- **Search Functionality**
  - Search for users by username or full name
  - Search for posts by caption
  - Live search results as you type

- **Responsive Design**
  - Mobile-first approach
  - Optimized for various screen sizes
  - Intuitive navigation

## Tech Stack

- **Frontend**: 
  - Next.js 15 (App Router)
  - React 19
  - Tailwind CSS
  - shadcn/ui components

- **Backend**: 
  - Supabase (Authentication, Database, Storage)
  - Server Components for data fetching
  - Server Actions for mutations

- **Data Storage**:
  - Supabase PostgreSQL database
  - Supabase storage for images

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup Supabase

1. Create a new Supabase project
2. Run the SQL from `supabase/schema.sql` in the Supabase SQL editor to set up the database tables
3. Run the SQL from `supabase/storage.sql` to set up the storage bucket and policies

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── (auth)/           # Authentication routes
│   │   ├── login/        # Login page
│   │   └── signup/       # Signup page
│   ├── (main)/           # Main app routes (protected)
│   │   ├── feed/         # Feed page
│   │   ├── profile/      # Profile pages
│   │   │   ├── [username]/ # Dynamic user profile pages
│   │   │   └── edit/     # Profile edit page
│   │   ├── create/       # Create post page
│   │   ├── post/         # Individual post pages
│   │   │   └── [id]/     # Dynamic post pages
│   │   ├── search/       # Search functionality
│   │   └── layout.tsx    # Main layout with navigation
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root page (redirects to feed or login)
├── components/           # Reusable React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── PostCard.tsx      # Post card component
│   ├── PostDetail.tsx    # Detailed post view
│   ├── CommentsSection.tsx # Comments functionality
│   ├── FollowButton.tsx  # Follow/unfollow button
│   └── ProfileEditForm.tsx # Profile editing form
├── lib/                  # Library code and types
│   └── database.types.ts # TypeScript types for Supabase
├── public/               # Static assets
├── supabase/             # Supabase related files
│   ├── schema.sql        # Database schema
│   └── storage.sql       # Storage configuration
└── utils/                # Utility functions
    └── supabase/         # Supabase client utilities
```
# cssg-final
