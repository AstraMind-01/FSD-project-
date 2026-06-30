# DevBoard - Full-Stack Developer Workspace & Task Board

DevBoard is a developer task and project management platform built for small software engineering teams. It implements project workspaces, drag-and-drop Kanban boards, role-based controls (Admins & Members), real-time notifications via Socket.io, file attachments parsed via Multer and uploaded to Cloudinary, automated email reminder crons, and interactive analytics charts using Recharts.

---

## 📂 Project Structure

```
DevBoard/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable widgets (Sidebar, Navbar, Kanban, Task Card/Modal)
│   │   ├── context/            # App States (AuthContext, SocketContext, NotificationContext)
│   │   ├── layouts/            # Layout wraps (DashboardLayout)
│   │   ├── pages/              # Router views (Login, Register, Dashboard, Projects, Workspace)
│   │   ├── services/           # Connection clients (Axios client config)
│   │   ├── routes/             # App routing structure (AppRoutes)
│   │   ├── index.css           # Global Tailwind and customized UI styles
│   │   └── App.jsx & main.jsx  # Frontend boot-strap entries
│   ├── index.html              # HTML shell & font definitions
│   ├── tailwind.config.js      # Tailwind configurations
│   └── package.json            # Client packages config
│
└── server/                     # Node + Express Backend
    ├── config/                 # DB connections & Cloudinary settings
    ├── controllers/            # HTTP Request controllers (Auth, Project, Task, Alerts, Stats)
    ├── models/                 # Mongoose schema models (User, Project, Task, Notification)
    ├── middleware/             # Express middlewares (JWT protections, Multer parser, Error handler)
    ├── routes/                 # Express REST endpoint maps
    ├── sockets/                # Socket.io Room connection handler
    ├── services/               # SMTP Nodemailer integrations
    ├── jobs/                   # node-cron scheduled tasks (Daily 8:00 AM alerts)
    ├── utils/                  # JWT generators & formatting helpers
    ├── server.js               # Express application entry server
    └── package.json            # Server packages config
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios, Context API, Recharts, `@dnd-kit/core`, `socket.io-client`, `lucide-react`.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), Socket.io, JWT Authentication, Cookie-Parser, Multer, Cloudinary SDK, Nodemailer, `node-cron`, `bcryptjs`.
- **Deployment**: Vercel (Client), Railway (Server), MongoDB Atlas (Database).

---

## 🔑 Database Models Schema

### 1. User
- `name` (String, required, trim)
- `email` (String, required, unique, trim, lowercase)
- `password` (String, required)
- `role` (String, enum: `['Admin', 'Member']`, default: `'Member'`)
- `avatar` (String, default: UI Avatars generator url)
- `timestamps: true`

### 2. Project
- `name` (String, required, trim)
- `description` (String, required, trim)
- `owner` (ObjectId, ref: `User`, required)
- `members` (Array of ObjectIds, ref: `User`)
- `timestamps: true`

### 3. Task
- `title` (String, required, trim)
- `description` (String, trim)
- `status` (String, enum: `['To Do', 'In Progress', 'Done']`, default: `'To Do'`)
- `priority` (String, enum: `['Low', 'Medium', 'High']`, default: `'Medium'`)
- `dueDate` (Date, required)
- `assignee` (ObjectId, ref: `User`, default: null)
- `project` (ObjectId, ref: `Project`, required)
- `attachments` (Array: `{ name: String, url: String, publicId: String, uploadedAt: Date }`)
- `timestamps: true`

### 4. Notification
- `user` (ObjectId, ref: `User`, required)
- `message` (String, required)
- `read` (Boolean, default: `false`)
- `timestamps: true`

---

## 📡 API Documentation

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user account.
- `POST /login` - Sign in user (verifies credentials, sets HTTP-only cookie).
- `POST /logout` - Clear user session cookie.
- `GET /me` - Get current session's profile.
- `GET /members` - Get list of all users in the workspace (for inviting members).

### Project Routes (`/api/projects`)
- `POST /` - Create a new project (Admin only).
- `GET /` - List all projects (Admins see all; Members see projects they are owner or member of).
- `GET /:id` - Get detail of a specific project workspace.
- `PUT /:id` - Edit project details (Admin only).
- `DELETE /:id` - Delete project (Admin only).
- `POST /:id/members` - Invite user to project members list (Admin only).
- `DELETE /:id/members/:userId` - Remove member from project (Admin only).

### Task Routes (`/api/tasks`)
- `POST /` - Create a task in a project (Admin only).
- `GET /:id` - Get details of a single task.
- `PUT /:id` - Edit task properties (Admin only).
- `DELETE /:id` - Delete task (Admin only).
- `PATCH /:id/status` - Move task between Kanban columns (Admin, Owner, or Assignee only).
- `POST /:id/attachments` - Upload file attachment to task (Admin, Owner, or Assignee only).
- `GET /project/:projectId` - Get all tasks for a project.

### Notification Routes (`/api/notifications`)
- `GET /` - Get all unread/read notifications for current logged-in user.
- `PATCH /:id/read` - Mark a single notification as read.
- `PATCH /read-all` - Mark all notifications as read.

### Dashboard Routes (`/api/dashboard`)
- `GET /summary` - Compile stats of tasks (total, completed, overdue) and data for charts (by status, priority, 7-day completion line).

---

## ⚙️ Environment Variables Checklist

Create a `.env` file in both `client/` and `server/` directories using the models below:

### Server Environment (`server/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Cloudinary credentials (for file attachments)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP credentials (Gmail App password recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_account@gmail.com
SMTP_PASS=your_gmail_app_password

# Client Domain (CORS control)
CLIENT_URL=http://localhost:5173
```

### Client Environment (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Local Installation Guide

### Prerequisites
- Node.js (v16+) installed.
- A MongoDB database connection URI (Atlas).
- A Cloudinary account for media upload.

### Step 1: Clone the repository and install server dependencies
```bash
# Install Server packages
cd server
npm install
```

### Step 2: Configure Server variables
Create `server/.env` and paste your MongoDB URI, JWT Secret, Cloudinary credentials, and Gmail SMTP details.

### Step 3: Install client dependencies
```bash
# Go back to root, then client
cd ../client
npm install
```

### Step 4: Run dev environments
```bash
# In Server directory
npm run dev

# In Client directory
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🌐 Production Deployment Guide

### 1. Database Setup (MongoDB Atlas)
1. Register/Login to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Free Shared Cluster.
3. In **Database Access**, create a user with read/write privileges.
4. In **Network Access**, whitelist `0.0.0.0/0` (Allows server query bindings).
5. In **Database**, click **Connect** -> **Connect your application** and copy the URI connection string.

### 2. Backend Deployment (Railway)
1. Sign up/Login to [Railway.app](https://railway.app).
2. Select **New Project** -> **Deploy from GitHub repo** -> Choose your backend/project repository.
3. In project settings, set the root directory to `server/` or point build commands accordingly.
4. In **Variables** tab, add all environment variables defined in `server/.env` file.
5. In settings, click **Generate Domain** to get your backend URL (e.g. `https://devboard-production.up.railway.app`).

### 3. Frontend Deployment (Vercel)
1. Sign up/Login to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project** -> Import your GitHub repository.
3. Configure settings:
   - **Framework Preset**: `Vite`.
   - **Root Directory**: `client/`.
4. In **Environment Variables** accordion, add:
   - `VITE_API_URL` = `https://your-railway-app-url.up.railway.app/api`
   - `VITE_SOCKET_URL` = `https://your-railway-app-url.up.railway.app`
5. Click **Deploy**. Vercel will build and provide a production domain.
6. **IMPORTANT**: Return to Railway variables and update `CLIENT_URL` to your new Vercel domain to ensure CORS authorizations work!
