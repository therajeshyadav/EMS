# Employee Management System (EMS)

A comprehensive Employee Management System built with React.js frontend and Node.js backend, featuring real-time notifications, attendance tracking, payroll management, and task assignment capabilities.

## 🚀 Features

### Admin Dashboard
- **Employee Management**: Add, edit, delete, and view employee profiles
- **Department Management**: Organize employees by departments
- **Position Management**: Define and assign job positions
- **Task Management**: Create and assign tasks to employees
- **Attendance Monitoring**: Track employee attendance and generate reports
- **Payroll Management**: Generate payslips and manage salary processing
- **Leave Management**: Approve/reject leave requests
- **Real-time Notifications**: Send notifications to employees or departments
- **Reports & Analytics**: Generate attendance and performance reports

### Employee Dashboard
- **Personal Profile**: View and update personal information
- **Attendance Tracking**: Check-in/check-out functionality
- **Task Management**: View assigned tasks and update status
- **Leave Requests**: Submit and track leave applications
- **Payroll**: View payslips and salary history
- **Notifications**: Receive real-time updates and announcements

### Real-time Features
- **Socket.io Integration**: Real-time notifications and updates
- **Live Attendance Status**: Real-time attendance monitoring
- **Instant Task Updates**: Live task status changes
- **Push Notifications**: Immediate notification delivery

## 🛠️ Technology Stack

### Frontend
- **React.js** - User interface library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time communication
- **React Context** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time communication
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management

### Database
- **MongoDB Atlas** - Cloud database service
- **Mongoose ODM** - Object Document Mapping

## 📁 Project Structure

```
EMS/
├── Backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── models/
│   │   ├── Employee.js           # Employee schema
│   │   ├── User.js               # User authentication schema
│   │   ├── Department.js         # Department schema
│   │   ├── Position.js           # Position schema
│   │   ├── tasks.js              # Task schema
│   │   ├── attendance.js         # Attendance schema
│   │   ├── leave.js              # Leave schema
│   │   ├── Payroll.js            # Payroll schema
│   │   └── Notification.js       # Notification schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── employeeRoute.js      # Employee management routes
│   │   ├── attendance.js         # Attendance routes
│   │   ├── leave.js              # Leave management routes
│   │   ├── task.js               # Task management routes
│   │   ├── PayRollRoute.js       # Payroll routes
│   │   ├── Notification.js       # Notification routes
│   │   ├── DepartmentRoute.js    # Department routes
│   │   ├── PositionRoute.js      # Position routes
│   │   └── reportsRoute.js       # Reports routes
│   ├── Services/
│   │   ├── cacheService.js       # Redis caching service
│   │   ├── mockCacheService.js   # Mock cache for development
│   │   ├── paginationService.js  # Pagination utilities
│   │   └── queryOptimizationService.js # Query optimization
│   ├── scripts/
│   │   ├── setup.js              # Database setup script
│   │   ├── createIndexes.js      # Database indexes
│   │   └── performanceTest.js    # Performance testing
│   ├── socket.js                 # Socket.io configuration
│   ├── server.js                 # Main server file
│   └── .env                      # Environment variables
├── Frontend/
│   ├── public/
│   │   └── vite.svg              # App icon
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js            # API service layer
│   │   ├── components/
│   │   │   ├── Employee/         # Employee components
│   │   │   ├── Admin/            # Admin components
│   │   │   ├── Auth/             # Authentication components
│   │   │   └── Common/           # Shared components
│   │   ├── context/
│   │   │   └── Authprovider.jsx  # Authentication context
│   │   ├── hooks/
│   │   │   ├── usePagination.js  # Pagination hook
│   │   │   └── useInfiniteScroll.js # Infinite scroll hook
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── EmployeeDashboard.jsx
│   │   ├── socket.js             # Socket.io client
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # App entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EMS
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the Backend directory:
   ```env
   PORT=5003
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/EmployeeDatabase?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   ```

5. **Database Setup**
   ```bash
   cd Backend
   node scripts/setup.js
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Backend
   npm start
   # or for development
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5003`

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication with role-based access control:

- **Admin**: Full access to all features
- **Manager**: Limited admin access
- **Employee**: Access to personal dashboard only

### Default Admin Account
After running the setup script, you can create an admin account or use the registration system.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Employee Management
- `GET /api/employees` - Get all employees (Admin only)
- `GET /api/employees/me` - Get current employee profile
- `POST /api/employees` - Create new employee (Admin only)
- `PUT /api/employees/:id` - Update employee (Admin only)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/check-in` - Employee check-in
- `POST /api/attendance/check-out` - Employee check-out
- `GET /api/attendance/reports` - Generate attendance reports

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/me/:employeeId` - Get employee tasks
- `POST /api/tasks` - Create new task (Admin only)
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status

### Leaves
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Submit leave request
- `PUT /api/leaves/:id/approve` - Approve leave (Admin only)
- `PUT /api/leaves/:id/reject` - Reject leave (Admin only)

### Payroll
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll/generate` - Generate payroll (Admin only)
- `GET /api/payroll/payslip/:employeeId` - Get employee payslip

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Send notification (Admin only)
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5003
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
REDIS_HOST=localhost (optional)
REDIS_PORT=6379 (optional)
```

### Database Indexes
The system automatically creates necessary indexes for optimal performance:
- Employee email and employeeId indexes
- Attendance date indexes
- Task status and assignee indexes

## 🚀 Deployment

### Backend Deployment (Render/Heroku/Railway)

1. **Deploy to Render (Recommended)**
   - Connect your GitHub repository
   - Set the build command: `cd Backend && npm install`
   - Set the start command: `cd Backend && npm start`
   - Add environment variables:
     ```
     PORT=10000
     MONGO_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret
     NODE_ENV=production
     ```

2. **Deploy to Heroku**
   ```bash
   # Install Heroku CLI and login
   heroku create your-app-name
   heroku config:set MONGO_URI=your_mongodb_connection
   heroku config:set JWT_SECRET=your_jwt_secret
   git subtree push --prefix Backend heroku main
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Update Environment Variables**
   - Edit `Frontend/.env.production`
   - Replace `https://your-backend-url.onrender.com` with your actual backend URL
   
   ```env
   VITE_API_BASE_URL=https://your-actual-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-actual-backend-url.onrender.com
   ```

2. **Deploy to Vercel**
   ```bash
   cd Frontend
   npm run build
   # Upload dist folder to Vercel or connect GitHub repo
   ```

3. **Deploy to Netlify**
   ```bash
   cd Frontend
   npm run build
   # Drag and drop dist folder to Netlify or connect GitHub repo
   ```

### Post-Deployment Steps
1. Update CORS settings in backend if needed
2. Test all API endpoints
3. Verify WebSocket connections work
4. Check database connectivity

## 🧪 Testing

### Performance Testing
```bash
cd Backend
node scripts/performanceTest.js
```

### API Testing
Use tools like Postman or Thunder Client to test API endpoints.

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill existing Node processes
   taskkill /f /im node.exe  # Windows
   # or
   pkill node  # Linux/Mac
   ```

2. **MongoDB Connection Issues**
   - Verify MongoDB URI in .env file
   - Check network access in MongoDB Atlas
   - Ensure IP whitelist includes your IP

3. **Cache Errors**
   - The system uses mock cache service by default
   - Redis is optional for development

4. **Employee Data Not Showing**
   - Check if backend server is running
   - Verify API endpoints are accessible
   - Check browser console for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- React.js community for excellent documentation
- MongoDB for reliable database service
- Socket.io for real-time communication capabilities
- Tailwind CSS for beautiful styling utilities

---

**Happy Coding! 🚀**
