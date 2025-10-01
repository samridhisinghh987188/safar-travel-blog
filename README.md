# 🌍 SAFAR - Travel Blog Platform

A modern, interactive travel blog platform built with React, featuring 3D Earth visualization, trip planning, and user authentication.

## ✨ Features

### 🎯 Core Features
- **Interactive 3D Earth Model** - Rotating globe with WebGL rendering
- **User Authentication** - Sign up/Sign in with Supabase
- **Trip Planning** - Complete itinerary management with budget tracking
- **Blog System** - Create public and private travel blogs
- **Monument Showcase** - Interactive display of world monuments
- **Responsive Design** - Works on all devices

### 🔐 Authentication & Privacy
- Supabase authentication integration
- Demo account functionality
- User-specific data isolation
- Private vs public blog posts
- Secure user sessions

### 📝 Blog Features
- Rich text blog creation
- Image upload and storage
- Rating system (1-5 stars)
- Location tagging
- Author attribution
- Public/Private post visibility
- Responsive blog cards

### 🗺️ Trip Planning
- Destination planning
- Itinerary management
- Budget tracking (multiple currencies)
- Accommodation booking tracker
- Transportation planning
- Travel checklist
- Save multiple trips

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Three.js & React Three Fiber** - 3D graphics
- **Lucide React** - Beautiful icons

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Supabase Storage** - File storage
- **Real-time subscriptions** - Live data updates

### 3D Graphics
- **Three.js** - 3D rendering engine
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **GLTF Models** - 3D Earth model

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/travel-blog.git
   cd travel-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the SQL migrations in your Supabase dashboard:
   ```bash
   # Navigate to Supabase Dashboard > SQL Editor
   # Run the migration files in supabase/migrations/
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
travel-blog/
├── public/
│   ├── earth.gltf          # 3D Earth model
│   ├── earth.bin           # Earth model binary
│   └── Videos/             # Demo videos
├── src/
│   ├── components/         # Reusable components
│   │   ├── ui/            # UI components
│   │   ├── AuthModal.jsx  # Authentication modal
│   │   ├── BlogForm.jsx   # Blog creation form
│   │   └── Navbar.jsx     # Navigation component
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── Landing.jsx    # Landing page with 3D Earth
│   │   ├── Blog.jsx       # Blog management
│   │   ├── BlogPostPage.jsx
│   │   └── TripPlanning.jsx
│   ├── services/          # API services
│   │   └── blogService.js # Supabase blog operations
│   ├── utils/             # Utility functions
│   │   ├── storage.js     # File storage utilities
│   │   └── userStorage.js # User data management
│   └── lib/
│       └── supabase.js    # Supabase configuration
├── supabase/
│   └── migrations/        # Database migrations
└── package.json
```

## 🎮 Usage

### Creating a Blog Post
1. Navigate to the Blog section
2. Click "Add New Post"
3. Fill in title, location, description
4. Upload a cover image
5. Set rating and privacy settings
6. Publish your post

### Trip Planning
1. Go to Trip Planning section
2. Enter destination and dates
3. Add itinerary items
4. Set budget for different categories
5. Track accommodation and transport
6. Use the travel checklist

### 3D Earth Interaction
- **Rotate**: Click and drag to rotate the Earth
- **Zoom**: Scroll to zoom in/out
- **Auto-rotation**: Earth rotates automatically

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up authentication providers
3. Create the required tables using migrations
4. Configure storage buckets for images
5. Set up Row Level Security (RLS) policies

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🚀 Deployment

### Netlify (Recommended)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard
4. Configure redirects for SPA routing

### Vercel
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js** for amazing 3D capabilities
- **Supabase** for excellent backend services
- **Tailwind CSS** for beautiful styling
- **React Three Fiber** for React integration
- **Unsplash** for monument images

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the maintainers

---

Made with ❤️ for travel enthusiasts worldwide 🌍
