# Assesium Backend API

A comprehensive Node.js backend API for the Assesium educational platform, built with TypeScript, Express, Prisma, and PostgreSQL.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **User Management**: Admin capabilities for user status management (active/suspended/banned)
- **Blog Management**: Full CRUD operations for blog posts with image upload support
- **Image Upload**: Cloudinary integration for image storage and management
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Validation**: Comprehensive input validation and error handling
- **CORS**: Configured for frontend integration
- **Security**: Password hashing, JWT tokens, and secure headers

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Image Upload**: Cloudinary
- **Validation**: express-validator
- **CORS**: cors middleware

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Admin (Requires ADMINISTRATOR role)
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users with pagination
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user

### Blog Posts
- `GET /api/blog/posts` - Get all blog posts (public)
- `GET /api/blog/posts/user` - Get current user's blog posts
- `POST /api/blog/posts` - Create new blog post (authenticated)
- `PUT /api/blog/posts/:id` - Update blog post (owner only)
- `DELETE /api/blog/posts/:id` - Delete blog post (owner only)
- `POST /api/blog/upload-image` - Upload image to Cloudinary

### Health Check
- `GET /api/health` - API health status

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/assesium_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Frontend URLs (for CORS)
FRONTEND_URL="http://localhost:5173"
DEPLOYED_FRONTEND_URL="https://your-frontend-domain.com"

# Server Configuration
NODE_ENV="development"
PORT=5000
```

## Installation & Setup

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Cloudinary account (for image uploads)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assesium-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Push database schema
   npm run prisma:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Database Schema

### User Model
- `id`: Unique identifier
- `email`: User email (unique)
- `firstName`: User's first name
- `lastName`: User's last name
- `schoolName`: School affiliation
- `role`: USER or ADMINISTRATOR
- `status`: ACTIVE, SUSPENDED, or BANNED
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### BlogPost Model
- `id`: Unique identifier
- `title`: Post title
- `content`: Post content
- `imageUrl`: Featured image URL (optional)
- `authorId`: Reference to User
- `createdAt`: Post creation timestamp
- `updatedAt`: Last update timestamp

## Deployment

### Render.com Deployment

1. **Connect your repository** to Render
2. **Set environment variables** in Render dashboard
3. **Deploy** using the provided `render.yaml` configuration

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t assesium-backend .
   ```

2. **Run container**
   ```bash
   docker run -p 5000:5000 --env-file .env assesium-backend
   ```

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **USER**: Regular users who can create and manage their own blog posts
- **ADMINISTRATOR**: Admin users who can manage all users and have access to admin endpoints

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication errors
- Authorization errors
- Database errors
- File upload errors
- Server errors

## Security Features

- Password hashing using bcryptjs
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting (recommended for production)

## Development

### Database Operations

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema changes to database
npm run prisma:push

# Create and run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### Code Structure

```
src/
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── models/          # Database models (Prisma)
├── routes/          # API routes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

