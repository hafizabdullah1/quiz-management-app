# Quiz Management App - Backend API

A comprehensive backend API for managing quizzes, tracking student behavior, and providing analytics for teachers.

## 🚀 Features

- **Teacher Authentication**: JWT-based authentication with email/password and Google OAuth
- **Quiz Management**: Create, edit, delete, and duplicate quizzes
- **Student Tracking**: Monitor tab shifts, time spent, and suspicious behavior
- **Real-time Monitoring**: Socket.io integration for live tracking
- **Analytics**: Comprehensive reports and performance metrics
- **Security**: Rate limiting, input validation, and secure authentication

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## 📁 Project Structure

```
backend/
├── models/              # Database models
│   ├── User.js         # Teacher user model
│   ├── Quiz.js         # Quiz and question model
│   └── StudentSession.js # Student session tracking
├── middleware/          # Custom middleware
│   ├── auth.js         # Authentication middleware
│   ├── errorHandler.js # Error handling
│   └── validation.js   # Request validation
├── routes/              # API routes
│   ├── auth.js         # Authentication routes
│   ├── teacher.js      # Teacher-specific routes
│   ├── quiz.js         # Public quiz routes
│   ├── student.js      # Student routes
│   └── analytics.js    # Analytics and reporting
├── server.js           # Main server file
├── package.json        # Dependencies
└── env.example         # Environment variables template
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Update the following variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A strong secret key for JWT tokens
- `PORT`: Server port (default: 5000)

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

**Note:** This project uses ES modules (type: "module"). All imports/exports use ES6 syntax.

## 📊 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Teacher registration | Public |
| POST | `/login` | Teacher login | Public |
| POST | `/google` | Google OAuth | Public |
| POST | `/refresh` | Refresh JWT token | Private |
| GET | `/me` | Get current user | Private |
| POST | `/logout` | Logout user | Private |

### Teacher Routes (`/api/teacher`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/quizzes` | Create new quiz | Teacher |
| GET | `/quizzes` | Get teacher's quizzes | Teacher |
| GET | `/quizzes/:id` | Get specific quiz | Teacher |
| PUT | `/quizzes/:id` | Update quiz | Teacher |
| DELETE | `/quizzes/:id` | Delete quiz | Teacher |
| GET | `/dashboard` | Teacher dashboard | Teacher |

### Quiz Routes (`/api/quiz`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/:shareableLink` | Get quiz by link | Public |
| POST | `/:shareableLink/start` | Start student session | Public |
| GET | `/session/:sessionId` | Get session details | Public |
| POST | `/session/:sessionId/answer` | Submit answer | Public |
| POST | `/session/:sessionId/complete` | Complete quiz | Public |
| POST | `/session/:sessionId/abandon` | Abandon quiz | Public |
| POST | `/session/:sessionId/tab-shift` | Track tab shift | Public |

### Student Routes (`/api/student`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/session/:sessionId/status` | Get session status | Public |
| GET | `/session/:sessionId/progress` | Get progress | Public |

### Analytics (`/api/analytics`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/quiz/:id` | Quiz analytics | Teacher |
| GET | `/quiz/:id/sessions` | Session details | Teacher |
| GET | `/overview` | Overall analytics | Teacher |
| GET | `/export/:quizId` | Export results | Teacher |

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Format

```json
{
  "userId": "user_id_here",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 📝 Request/Response Format

### Standard Response Format

```json
{
  "status": "success|error",
  "message": "Human readable message",
  "data": {
    // Response data
  }
}
```

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message",
      "value": "invalid_value"
    }
  ]
}
```

## 🗄️ Database Models

### User Model
- Teacher authentication and profile
- Password hashing with bcrypt
- Email verification support
- Google OAuth integration

### Quiz Model
- Multiple question types (MCQ, True/False, Short Answer, Essay)
- Time limits and scoring
- Shareable links
- Proctoring settings

### StudentSession Model
- Student quiz attempts
- Tab shift tracking
- Answer submission
- Behavior monitoring

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Comprehensive request validation
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers and protection
- **JWT**: Secure token-based authentication
- **Password Hashing**: Bcrypt with configurable rounds

## 📡 Real-time Features

Socket.io integration for:
- Live tab shift tracking
- Real-time warnings
- Session monitoring
- Teacher notifications

## 🧪 Testing

```bash
npm test
```

## 📦 Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set strong JWT secret
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up monitoring and logging

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `MONGODB_URI` | - | MongoDB connection string |
| `JWT_SECRET` | - | JWT signing secret |
| `JWT_EXPIRE` | 7d | JWT expiration time |
| `BCRYPT_ROUNDS` | 12 | Password hashing rounds |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |

## 🚨 Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- Rate limiting errors
- Custom business logic errors

## 📈 Performance

- Database indexing for optimal queries
- Pagination for large datasets
- Efficient aggregation pipelines
- Connection pooling
- Rate limiting to prevent abuse

## 🤝 Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include validation for new endpoints
4. Update documentation
5. Test thoroughly

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review error logs
3. Test with minimal data
4. Create detailed issue reports
