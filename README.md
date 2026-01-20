# Crypto MLM Platform

Production-ready Multi-Level Marketing platform with real-time earnings, cryptocurrency integration, and complete admin controls.

## Setup

### 1. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment
Create `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/crypto-mlm
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

### 3. Initialize Database
```bash
cd server
node scripts/seed-production.js
```

### 4. Start Servers
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd ../client && npm start
```

## Production Configuration

| Setting | Value |
|---------|-------|
| Direct Commission | 8% |
| Level 1-5 Commission | 4%, 2%, 1%, 0.5%, 0.25% |
| Withdrawal Fee | 3% |
| Platform Fee | 2% |
| Min Withdrawal | $100 |
| Max Withdrawal | $100,000 |

## Features

✅ User registration & authentication (JWT)
✅ Investment plan management (CRUD)
✅ Real-time earning calculation (hourly cron)
✅ Withdrawal requests with admin approval
✅ Complete transaction history
✅ Multi-level commission tracking
✅ Admin dashboard & controls
✅ Role-based access control
✅ Password hashing (bcryptjs)
✅ Error handling & validation

## Database Models

- **Users**: Member accounts with MLM hierarchy
- **Plans**: Investment packages with returns
- **Investments**: User investment tracking
- **Transactions**: Complete audit trail
- **Withdrawals**: Withdrawal management
- **Commissions**: Commission tracking
- **AdminSettings**: Platform configuration

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### User
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/dashboard` - Dashboard data

### Plans
- `GET /api/plans` - List plans
- `POST /api/plans` - Create (Admin)
- `PUT /api/plans/:id` - Update (Admin)
- `DELETE /api/plans/:id` - Delete (Admin)

### Investments
- `POST /api/investments` - Create investment
- `GET /api/investments` - List investments
- `GET /api/investments/:id` - Get details

### Wallet
- `GET /api/wallet/balance` - Get balance
- `POST /api/wallet/deposit` - Deposit funds

### Withdrawals
- `POST /api/withdrawals` - Request withdrawal
- `GET /api/withdrawals` - List requests
- `POST /api/withdrawals/:id/approve` - Approve (Admin)

### Transactions
- `GET /api/transactions` - Get history

### Reports
- `GET /api/reports/daily-income` - Daily income
- `GET /api/reports/direct-income` - Direct income
- `GET /api/reports/downline` - Downline data

### Admin
- `GET /api/admin/users` - All users
- `GET /api/admin/withdrawals` - Pending withdrawals
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

## Deployment

### Prerequisites
- Node.js v14+
- MongoDB v4.0+
- npm or yarn

### Production Build
```bash
cd client && npm run build
```

### Hosting Options
- Heroku: `git push heroku main`
- AWS: Deploy to EC2 or Elastic Beanstalk
- DigitalOcean: Deploy to Droplet
- Azure: Deploy to App Service

## Security

- JWT tokens (7-day expiration)
- bcryptjs hashing (10 rounds)
- CORS enabled
- Input validation
- Role-based access control
- Error handling

## Support

Review logs and environment configuration for issues.

- **Messaging System**: Internal communication platform
- **Ticket System**: Customer support management
- **Email/SMS Notifications**: Automated communication
- **FAQ System**: Self-service knowledge base

### 9. Learning & Training Module
- **Educational Content**: Crypto and MLM tutorials
- **Training Courses**: Structured learning programs
- **Investment Guides**: Best practices and strategies

### 10. Analytics & Reporting
- **Dashboard Widgets**: Real-time metrics and KPIs
- **User Analytics**: Personal performance tracking
- **Admin Reports**: Comprehensive business intelligence
- **Growth Metrics**: Network expansion analytics

## 🔒 Security Features

- **SSL/TLS Encryption**: Industry-standard security protocols
- **Two-Factor Authentication**: Multi-layer account protection
- **Data Encryption**: Advanced cryptographic algorithms
- **Code Audits**: Regular security assessments
- **Anti-Fraud Monitoring**: Real-time fraud detection
- **Compliance Framework**: Regulatory adherence

## 🛠 Technology Stack

### Frontend
- React.js with TypeScript
- Material-UI for modern interface
- Redux for state management
- Chart.js for analytics visualization

### Backend
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- WebSocket for real-time updates

### Blockchain Integration
- Web3.js for Ethereum integration
- Bitcoin.js for Bitcoin transactions
- Multi-wallet support (MetaMask, WalletConnect)

### Security
- bcrypt for password hashing
- helmet.js for security headers
- rate-limiting for API protection
- CORS configuration

## 📋 Installation & Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Set up database connections
5. Configure blockchain networks
6. Run the application: `npm start`

## 🔧 Configuration

### Environment Variables
- Database connection strings
- Blockchain network configurations
- API keys for external services
- Security certificates

### Compliance Settings
- KYC verification requirements
- AML monitoring parameters
- Regulatory compliance rules

## 📊 Database Schema

### Users
- Personal information
- KYC verification status
- Wallet addresses
- Investment history

### Investments
- Investment plans
- ROI calculations
- Payout schedules
- Transaction records

### MLM Network
- Referral relationships
- Commission structures
- Network genealogy
- Performance metrics

## 🚦 API Documentation

### Authentication Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-email
- POST /api/auth/forgot-password

### Investment Endpoints
- GET /api/investments/plans
- POST /api/investments/create
- GET /api/investments/history
- POST /api/investments/withdraw

### MLM Network Endpoints
- GET /api/network/genealogy
- GET /api/network/commissions
- POST /api/network/referral
- GET /api/network/statistics

## 📈 Roadmap

### Phase 1: Core Infrastructure
- User authentication system
- Basic investment functionality
- Admin panel foundation

### Phase 2: MLM Features
- Network structure implementation
- Commission calculation system
- Genealogy tree visualization

### Phase 3: Advanced Features
- Crypto wallet integration
- Payment gateway setup
- Security enhancements

### Phase 4: Compliance & Analytics
- KYC/AML implementation
- Reporting dashboard
- Audit trail system

## 🤝 Contributing

Please read our contributing guidelines and code of conduct before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This platform is designed for educational and business purposes. Users must comply with local regulations regarding cryptocurrency and MLM activities. The developers are not responsible for any legal issues arising from the use of this platform.