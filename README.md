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
