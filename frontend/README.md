# Quiz Management App - Frontend (Next.js)

A modern, responsive Next.js application for creating, managing, and analyzing quizzes with real-time proctoring capabilities.

## 🚀 Features

- **Next.js App Router** with server and client components
- **Modern UI/UX**: Tailwind CSS + Framer Motion
- **Real-time**: Socket.io integration
- **State Management**: Redux Toolkit + Redux Persist
- **Authentication**: JWT + optional Google OAuth
- **Responsive** with dark mode
- **Analytics Dashboard** and role-based access

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **State**: Redux Toolkit, Redux Persist
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP**: Axios with interceptors
- **Realtime**: Socket.io Client
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
frontend/
├── app/                     # Next.js app directory
│   ├── layout.jsx          # Root layout (providers, globals)
│   ├── providers.jsx       # Client-side providers (Redux, Theme, Toaster)
│   ├── page.jsx            # Home route
│   ├── login/page.jsx      # Login route
│   └── dashboard/page.jsx  # Dashboard route
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/           # Theme context
│   ├── pages/              # Reused page components (client)
│   ├── services/           # API + Socket services
│   └── store/              # Redux store and slices
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend server running (see backend README)

### Installation
```bash
cd frontend
npm install
```

### Environment
Create `.env.local` in `frontend/`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Development
```bash
npm run dev
```
App runs at `http://localhost:3000`.

### Production
```bash
npm run build
npm start
```

## 🌐 API & Services
- Configured in `src/services/api.js` using `NEXT_PUBLIC_*` envs
- Socket at `src/services/socketService.js` (`NEXT_PUBLIC_SOCKET_URL`)
- Auth/Quiz/Session/Analytics services already wired

## 🔌 Real-time
Use `socketService.connect()` after login to establish a connection.

## 🔐 Auth
- Redux Persist stores token
- Axios interceptor attaches token and refreshes on 401
- Use protected UI in app routes by checking Redux state

## 🧪 Testing
- Vitest + React Testing Library available

## Notes
- React Router usage remains in some components; for navigation between Next routes, prefer Next `Link` in new components. Existing components will still function where used within client pages.
