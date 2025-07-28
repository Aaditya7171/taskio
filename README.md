# Taskio - Modern Todo List Application

A feature-rich, modern todo list application built with Node.js, Express, TypeScript, React, and PostgreSQL. Taskio helps you manage tasks, build habits, and gain insights into your productivity patterns.

## 🚀 Features

### Core Features
- **User Authentication**: Secure authentication using Neon Auth
- **Task Management**: Full CRUD operations with priorities, due dates, and status tracking
- **Profile Management**: User profiles with customizable settings

### Advanced Features
- **📸 Photos & Voice Notes**: Attach images and voice memos to tasks
- **📝 Task Journaling**: Write reflections and notes for completed tasks
- **🎨 Kanban Board**: Visual task management with drag-and-drop functionality
- **📊 Productivity Insights**: Analytics and charts showing productivity patterns
- **🌈 Dual Themes**: Dark gradient theme and minimal black & white theme
- **🔥 Habit Tracking**: Build habits with streak tracking and daily completions
- **📅 Timeline View**: Calendar-based task visualization with workload analysis
- **🎯 Three.js Background**: Beautiful Hyperspeed background animation

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express framework
- **TypeScript** for type safety
- **PostgreSQL** (Neon DB) for data storage
- **Neon Auth** for authentication
- **AWS S3** for file storage
- **JWT** for session management

### Frontend
- **React** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **React Beautiful DnD** for drag-and-drop
- **Recharts** for analytics visualization
- **Three.js** for 3D background effects

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Neon DB recommended)
- AWS S3 bucket (for file uploads)

### Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://neondb_owner:npg_d6wS0CjomnhL@ep-restless-pond-adyolfc1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

   # Stack Auth
   STACK_SECRET_SERVER_KEY=ssk_pmemf4jgex91v1m3e999hkps67jkdtjtefh4dskgmgmvg

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production

   # AWS S3 (for file uploads)
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=taskio-uploads

   # CORS
   FRONTEND_URL=http://localhost:5173
   ```

3. **Run database migrations**:
   ```bash
   npm run migrate
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the client directory:
   ```env
   VITE_STACK_PROJECT_ID=cced15ab-3219-4079-9b44-3a41eaf38b5d
   VITE_STACK_PUBLISHABLE_CLIENT_KEY=pck_e3b1cy77tas6vk14s9qq415kw5pcphbe2c4revhrmmtgr
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🚀 Usage

1. **Access the application**: Open your browser and navigate to `http://localhost:5173`

2. **Sign up/Login**: Use the Neon Auth integration to create an account or sign in

3. **Create tasks**: Start by creating your first task with title, description, priority, and due date

4. **Use Kanban board**: Switch to the Kanban view to manage tasks visually with drag-and-drop

5. **Track habits**: Create daily habits and track your streaks

6. **View analytics**: Check your productivity insights and patterns in the Analytics section

7. **Customize profile**: Update your profile information and switch between themes

## 🎨 Themes

### Dark Theme
- Purple, pink, and blue gradients
- Smooth animations and hover effects
- Breathing animations for interactive elements

### Minimal Theme
- Clean black and white design
- Pink, purple, and blue accents
- Subtle animations in accent colors

## 📊 Database Schema

### Users
- `id`, `stack_user_id`, `name`, `email`, `age`, `profile_picture_url`
- `created_at`, `updated_at`

### Tasks
- `id`, `user_id`, `title`, `description`, `due_date`
- `priority` (low/medium/high), `status` (todo/in_progress/done)
- `created_at`, `updated_at`

### Habits
- `id`, `user_id`, `name`, `description`, `streak_count`
- `last_completed`, `created_at`, `updated_at`

### Attachments
- `id`, `task_id`, `file_url`, `file_type`, `file_name`, `file_size`
- `created_at`

### Journals
- `id`, `task_id`, `entry`, `created_at`

### Habit Completions
- `id`, `habit_id`, `completed_date`, `created_at`

## 🔧 API Endpoints

### Authentication
- All endpoints require authentication via Bearer token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account
- `GET /api/users/stats` - Get user statistics

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `GET /api/habits/:id` - Get specific habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Mark habit as completed

### Analytics
- `GET /api/analytics/insights` - Get productivity insights
- `GET /api/analytics/timeline` - Get task timeline
- `GET /api/analytics/workload` - Get workload analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Neon** for the PostgreSQL database and authentication
- **Three.js** community for the amazing 3D graphics library
- **Tailwind CSS** for the utility-first CSS framework
- **React** and **Node.js** communities for the excellent ecosystems

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Happy productivity with Taskio! 🚀**
