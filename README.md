# Indian Baazaar Backend

A complete e-commerce backend API built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: User registration, login, profile management, Google OAuth support
- **Product Management**: CRUD operations for products with categories, search, and filtering
- **Order Management**: Complete order processing with payment integration
- **Review System**: Product reviews and ratings
- **Admin Panel**: Admin dashboard with statistics and management tools
- **Notifications**: User notification system

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens, bcrypt for password hashing
- **Validation**: Zod for request validation
- **Payment**: Razorpay integration
- **Development**: tsx for TypeScript execution

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the `.env` file and update the values:

```bash
# Database Configuration
DB_NAME=indian_baazaar
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Database Setup (Optional)

If you have PostgreSQL installed:

```bash
# Create database
createdb indian_baazaar

# Run migrations (if available)
npm run migrate

# Seed database (if available)
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Server health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### Products
- `GET /api/products` - Get all products (with search, filter, pagination)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search/suggestions` - Get search suggestions
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create new order (authenticated)
- `GET /api/orders` - Get user orders (authenticated)
- `GET /api/orders/:id` - Get order by ID (authenticated)
- `POST /api/payments/verify` - Verify payment (authenticated)

### Reviews
- `POST /api/reviews` - Create product review (authenticated)
- `GET /api/products/:productId/reviews` - Get product reviews

### Notifications
- `GET /api/notifications` - Get user notifications (authenticated)
- `PATCH /api/notifications/:id/read` - Mark notification as read (authenticated)
- `POST /api/notifications` - Create notification (admin only)
- `DELETE /api/notifications/:id` - Delete notification (admin only)

### Admin
- `GET /api/admin/customers` - Get all customers (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)
- `GET /api/admin/stats` - Get dashboard statistics (admin only)
- `PATCH /api/admin/orders/:id/status` - Update order status (admin only)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run format.fix` - Format code with Prettier

## Architecture

### Models
- **User**: User accounts with authentication
- **Product**: Product catalog with categories
- **Order**: Order management with items
- **OrderItem**: Individual order items
- **Review**: Product reviews and ratings
- **Notification**: User notifications

### Controllers
- **AuthController**: Authentication and user management
- **ProductController**: Product CRUD operations
- **OrderController**: Order processing
- **ReviewController**: Review management
- **NotificationController**: Notification system
- **AdminController**: Admin panel operations

### Middleware
- **Authentication**: JWT token verification
- **Authorization**: Role-based access control
- **Validation**: Request data validation

## Database Design

The application uses PostgreSQL with Sequelize ORM. Key relationships:

- Users have many Orders, Reviews, and Notifications
- Products have many Reviews and OrderItems
- Orders have many OrderItems
- Reviews belong to both Users and Products

## Development

### With Database
For full functionality, set up PostgreSQL and update the `.env` file with your database credentials.

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed messages
- Authentication and authorization errors
- Database connection errors with fallbacks
- Graceful error responses

## Security

- Password hashing with bcrypt
- JWT token-based authentication
- Input validation and sanitization
- Role-based access control
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## License

This project is licensed under the MIT License.
