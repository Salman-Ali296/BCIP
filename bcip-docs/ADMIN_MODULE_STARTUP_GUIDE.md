# BCIP Admin Module - Startup & Troubleshooting Guide

## Quick Start

### 1. Prerequisites
- PostgreSQL running on `localhost:5432`
- Redis running on `localhost:6379`
- Node.js v20+ installed
- Database `bcip_db` created

### 2. Start PostgreSQL & Redis (Docker)
```bash
cd bcip-ai-services
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

### 3. Setup Backend
```bash
cd bcip-backend

# Install dependencies (if not done)
npm install

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Start backend server (port 4000)
npm run dev
```

Backend will be available at: `http://localhost:4000`

### 4. Setup Frontend
```bash
cd bcip-frontend

# Install dependencies (if not done)
npm install

# Start frontend server (port 3000)
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 5. Create Admin User

You need a SUPER_ADMIN user to access the admin panel. Use Prisma Studio or SQL:

**Option A: Using Prisma Studio**
```bash
cd bcip-backend
npx prisma studio
```

Navigate to the `User` model and create a user with:
- email: admin@bcip.com
- password: (hashed with bcrypt - use the signup endpoint or hash manually)
- role: SUPER_ADMIN
- emailVerified: true
- isActive: true

**Option B: Using SQL directly**
```sql
-- First, hash a password using bcrypt (you can use an online tool or Node.js)
-- Example: "Admin@123" hashed = $2b$10$...

INSERT INTO "User" (id, email, password, "fullName", role, "accountType", "emailVerified", "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@bcip.com',
  '$2b$10$YourHashedPasswordHere',
  'System Administrator',
  'SUPER_ADMIN',
  'BUSINESS',
  true,
  true,
  (SELECT id FROM "Tenant" LIMIT 1), -- Use existing tenant or create one
  NOW(),
  NOW()
);
```

**Option C: Use the Signup API then update role**
```bash
# 1. Sign up normally through the UI at http://localhost:3000/signup

# 2. Update the user's role to SUPER_ADMIN in database
UPDATE "User" SET role = 'SUPER_ADMIN', "emailVerified" = true WHERE email = 'your-email@example.com';
```

### 6. Login to Admin Panel

1. Go to: `http://localhost:3000/login`
2. Enter your SUPER_ADMIN credentials
3. You'll be redirected to: `http://localhost:3000/admin/dashboard`

---

## Environment Configuration

### Backend (.env in bcip-backend/)
```env
DATABASE_URL="postgresql://postgres:salmanali123@localhost:5432/bcip_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-2024"
REDIS_URL="redis://localhost:6379"
PORT=4000
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# SMTP (optional for email features)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASSWORD=your-resend-api-key
EMAIL_FROM=BCIP <onboarding@resend.dev>
APP_BASE_URL=http://localhost:4000
```

### Frontend (.env.local in bcip-frontend/)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

**IMPORTANT**: Make sure the ports match:
- Backend: 4000 (as set in backend .env)
- Frontend: 3000 (default Next.js port)
- Frontend API calls: 4000 (as set in NEXT_PUBLIC_API_BASE_URL)

---

## Troubleshooting

### Problem 1: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it
cd bcip-ai-services
docker-compose up -d postgres

# Test connection
psql -h localhost -U postgres -d bcip_db
# Password: salmanali123
```

### Problem 2: "Admin pages show loading spinner forever"

**Causes:**
1. Backend not running
2. API URL mismatch
3. Authentication token issues

**Solutions:**

**Check backend is running:**
```bash
# Open http://localhost:4000/health in browser
# Should show: {"status":"ok",...}

# Or use curl
curl http://localhost:4000/health
```

**Check API URL:**
```bash
# Verify bcip-frontend/.env.local has:
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Restart frontend after changing .env.local:
cd bcip-frontend
npm run dev
```

**Check authentication:**
- Open browser DevTools (F12)
- Go to Application > Local Storage
- Check if `token` exists
- If not, login again at /login

**Check CORS:**
- Open browser DevTools Console
- Look for CORS errors
- Ensure backend .env has: `ALLOWED_ORIGINS="http://localhost:3000"`

### Problem 3: "401 Unauthorized" on admin routes

**Solution:**
```bash
# Verify user role in database
cd bcip-backend
npx prisma studio

# Check User table:
# - role should be "SUPER_ADMIN"
# - emailVerified should be true
# - isActive should be true

# Update if needed:
UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
```

### Problem 4: "Network Error" or blank pages

**Check all services:**
```bash
# 1. PostgreSQL (port 5432)
docker ps | grep postgres

# 2. Redis (port 6379)
docker ps | grep redis

# 3. Backend (port 4000)
curl http://localhost:4000/health

# 4. Frontend (port 3000)
# Open http://localhost:3000 in browser
```

### Problem 5: "API returns 404 Not Found"

**Check backend routes:**
```bash
# Backend should have these admin routes:
# GET /api/v1/admin/dashboard/stats
# GET /api/v1/admin/businesses
# GET /api/v1/admin/users
# etc.

# Test manually:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/v1/admin/dashboard/stats
```

**Verify admin routes are registered:**
```bash
cd bcip-backend
# Check src/routes/index.ts includes admin routes
# Should have: router.use('/admin', adminRoutes);
```

### Problem 6: Pages look broken or have wrong theme

**Solution:**
```bash
# Clear Next.js cache and rebuild
cd bcip-frontend
rm -rf .next
npm run dev

# Or in PowerShell:
cd bcip-frontend
Remove-Item -Recurse -Force .next
npm run dev
```

### Problem 7: "Prisma Client not generated"

**Solution:**
```bash
cd bcip-backend
npx prisma generate
npm run dev
```

### Problem 8: Dashboard shows "Failed to load data"

**Check backend logs:**
```bash
# Backend terminal should show requests
# Look for errors like:
# - Database connection errors
# - JWT validation errors
# - Missing columns in database

# If database schema is outdated:
cd bcip-backend
npx prisma migrate deploy
npx prisma generate
```

---

## Verification Checklist

Use this to verify everything is working:

### ✅ Backend Health
- [ ] `curl http://localhost:4000/health` returns `{"status":"ok"}`
- [ ] PostgreSQL is running (docker ps)
- [ ] Redis is running (docker ps)
- [ ] Backend terminal shows "Server running on http://localhost:4000"

### ✅ Frontend Health  
- [ ] `http://localhost:3000` loads the landing page
- [ ] Browser console has no errors
- [ ] `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

### ✅ Authentication
- [ ] Can login at `/login`
- [ ] After login, redirected to `/admin/dashboard` (for SUPER_ADMIN)
- [ ] localStorage has `token` and `user`
- [ ] User role is SUPER_ADMIN in database

### ✅ Admin Dashboard
- [ ] `/admin/dashboard` loads without errors
- [ ] Stats cards show numbers (not just 0s)
- [ ] Charts display data
- [ ] Sidebar navigation works

### ✅ Other Admin Pages
- [ ] `/admin/businesses` - lists businesses
- [ ] `/admin/users` - lists users
- [ ] `/admin/complaints` - lists complaints
- [ ] `/admin/ai-config` - shows AI settings
- [ ] `/admin/categories` - shows categories
- [ ] `/admin/moderation` - shows flagged items
- [ ] `/admin/settings` - shows platform settings
- [ ] `/admin/health` - shows service status
- [ ] `/admin/reports` - shows report interface

---

## Development Commands

### Backend
```bash
cd bcip-backend

# Development server with hot reload
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm test

# Database commands
npx prisma studio          # GUI for database
npx prisma migrate dev    # Create new migration
npx prisma migrate deploy # Apply migrations
npx prisma generate       # Regenerate Prisma Client
```

### Frontend
```bash
cd bcip-frontend

# Development server
npm run dev

# Lint check
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

---

## Production Deployment Notes

### Environment Variables
- Change JWT_SECRET to a secure random string
- Use production database URL
- Set NODE_ENV=production
- Configure proper CORS origins
- Use production SMTP credentials

### Database
- Run migrations: `npx prisma migrate deploy`
- Ensure database has proper indexes
- Set up automated backups

### Security
- Enable HTTPS
- Configure rate limiting
- Set secure cookie settings
- Implement proper logging
- Set up monitoring

---

## Common API Endpoints

### Authentication
- POST `/api/v1/auth/signup` - Register new user
- POST `/api/v1/auth/login` - Login
- GET `/api/v1/auth/me` - Get current user
- POST `/api/v1/auth/verify-email` - Verify email

### Admin Dashboard
- GET `/api/v1/admin/dashboard/stats` - Platform statistics
- GET `/api/v1/admin/dashboard/complaint-trends` - Trend data
- GET `/api/v1/admin/dashboard/category-distribution` - Category breakdown

### Admin Business Management
- GET `/api/v1/admin/businesses` - List all businesses
- GET `/api/v1/admin/businesses/:id` - Get business details
- PATCH `/api/v1/admin/businesses/:id/status` - Update business status

### Admin User Management
- GET `/api/v1/admin/users` - List all users
- GET `/api/v1/admin/users/:id` - Get user details
- PATCH `/api/v1/admin/users/:id/role` - Update user role
- PATCH `/api/v1/admin/users/:id/status` - Toggle user active status

### Admin Complaint Monitoring
- GET `/api/v1/admin/complaints` - List all complaints
- GET `/api/v1/admin/complaints/:id` - Get complaint details
- GET `/api/v1/admin/complaints/flagged` - Get flagged complaints

---

## Database Schema Quick Reference

### Key Tables
- **User**: id, email, password, fullName, role, accountType, emailVerified, isActive, tenantId
- **Tenant**: id, name, email, isActive, businessVerified (businesses)
- **Complaint**: id, trackingId, title, description, status, priority, aiCategory, aiSentiment
- **ComplaintCategory**: id, name, defaultPriority, keywords
- **SystemConfig**: key, value

### User Roles
- SUPER_ADMIN - Platform administrator (admin panel access)
- BUSINESS_ADMIN - Business owner
- MANAGER - Team manager
- AGENT - Support agent
- ESCALATION_AGENT - Escalation handler
- CUSTOMER - End customer

---

## Support & Resources

### Documentation Locations
- **Main README**: `README.md`
- **Screen Tracker**: `BCIP-Screen-Tracker.xlsx`
- **Completion Report**: `ADMIN_MODULE_COMPLETION_REPORT.md`
- **This Guide**: `ADMIN_MODULE_STARTUP_GUIDE.md`
- **Backend Routes**: `bcip-backend/src/modules/administration/admin.routes.ts`
- **Frontend API Client**: `bcip-frontend/src/lib/api/admin.ts`

### Logs Location
- Backend: Console output (terminal where `npm run dev` is running)
- Frontend: Browser DevTools Console
- Database queries: Enable Prisma logging in `bcip-backend/prisma/schema.prisma`

### Debug Mode
```typescript
// Add to bcip-backend/src/app.ts for request logging:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

---

## Contact Information

For issues with:
- **Backend API**: Check `bcip-backend/src/modules/administration/`
- **Frontend Pages**: Check `bcip-frontend/src/app/(admin)/admin/`
- **Authentication**: Check `bcip-frontend/src/providers/auth-provider.tsx`
- **Database**: Check `bcip-backend/prisma/schema.prisma`

---

**Last Updated**: January 14, 2027
**Version**: 1.0.0
**Status**: Production Ready
