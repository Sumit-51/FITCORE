# Admin Dashboard Documentation

## Overview
The FITCORE admin dashboard provides comprehensive management capabilities for gym administrators and super administrators.

## User Roles

### 1. Member (role: 'member')
- Access to member dashboard
- Can view gym information
- Can check-in/check-out
- View attendance and payment history

### 2. Gym Admin (role: 'gymAdmin')
- Manage their assigned gym
- View and approve/reject enrollment requests
- Manage gym members
- Update gym settings (name, address, fees, etc.)
- View gym statistics and reports

### 3. Super Admin (role: 'superAdmin')
- Full system access
- Manage all gyms
- View all gym admins
- Activate/deactivate gyms
- System-wide statistics and reports

## Features

### Gym Admin Dashboard (`/(admin)/home`)
- **Overview Statistics**:
  - Total members
  - Active members
  - Pending enrollment requests
  - Monthly revenue

- **Quick Actions**:
  - Review pending member requests
  - View all members
  - Update gym settings

### Member Management (`/(admin)/members`)
- View all enrollment requests
- Filter by status (All, Pending, Approved, Rejected)
- Approve or reject member enrollments
- View member details including:
  - Payment method (Online/Offline)
  - Transaction ID
  - Application date
  - Contact information

### Gym Settings (`/(admin)/settings`)
- Edit gym information:
  - Gym name
  - Address
  - Phone number
  - Email
  - UPI ID for payments
  - Monthly membership fee
- View gym status (Active/Inactive)
- Logout functionality

### Super Admin Dashboard (`/(admin)/super-admin-home`)
- **System-wide Statistics**:
  - Total gyms (active and inactive)
  - Total members across all gyms
  - Total gym admins
  - Pending enrollments system-wide
  - Monthly revenue across all gyms

- **Quick Actions**:
  - Manage all gyms
  - Manage gym administrators
  - View pending enrollments

### Gyms Management (`/(admin)/gyms`) - Super Admin Only
- View all registered gyms
- See gym details (address, contact, fees)
- Activate or deactivate gyms
- View gym statistics

### Admin Management (`/(admin)/admins`) - Super Admin Only
- View all gym administrators
- See which gym each admin manages
- View admin contact information
- Track admin assignments

## Role-Based Access Control

The system automatically routes users to the appropriate dashboard based on their role:

1. **Login Flow**:
   - User enters credentials
   - System checks user role in Firebase
   - Routes to appropriate dashboard:
     - `superAdmin` → Super Admin Dashboard
     - `gymAdmin` → Gym Admin Dashboard
     - `member` with approved status → Member Dashboard
     - `member` with pending status → Pending Approval Screen
     - `member` without enrollment → Gym Selection Screen

2. **Protected Routes**:
   - Admin routes check for `gymAdmin` or `superAdmin` role
   - Member routes check for `member` role with approved status
   - Cross-role access is prevented with redirects

## Database Structure

### Collections Used:

1. **users**
   - Fields: uid, email, displayName, role, gymId, enrollmentStatus
   - Roles: 'member', 'gymAdmin', 'superAdmin'

2. **gyms**
   - Fields: name, address, phone, email, upiId, monthlyFee, adminId, isActive
   - Managed by gym admins and super admin

3. **enrollments**
   - Fields: userId, userName, userEmail, gymId, gymName, paymentMethod, transactionId, amount, status, createdAt, verifiedAt, verifiedBy
   - Status: 'pending', 'approved', 'rejected'

## Design Consistency

All admin screens maintain the same design language as the member app:
- Dark theme (#0a0f1a background)
- Accent colors: Green (#4ade80), Blue (#3b82f6), Purple (#a855f7)
- Glassmorphism cards with subtle borders
- Consistent spacing and typography
- Smooth animations and interactions

## Security Features

- Firebase Authentication for all users
- Role-based access control at route level
- Protected database queries (gym admins only see their gym data)
- Super admin can view all data across the system
- Secure enrollment approval workflow
- Transaction ID tracking for payment verification

## Setup Instructions

To use the admin dashboard:

1. **Create Super Admin**:
   - Manually set a user's role to 'superAdmin' in Firebase
   - User will be routed to super admin dashboard on login

2. **Create Gym Admin**:
   - Set user's role to 'gymAdmin' in Firebase
   - Assign gymId to link admin to their gym
   - User will manage only their assigned gym

3. **Gym Setup**:
   - Super admin activates gyms in the system
   - Each gym needs an admin assigned

## Navigation Structure

```
/(admin)
├── _layout.tsx (Tab navigation)
├── home.tsx (Gym admin dashboard)
├── members.tsx (Member management)
├── settings.tsx (Gym settings)
├── super-admin-home.tsx (Super admin dashboard)
├── gyms.tsx (All gyms management - super admin)
└── admins.tsx (Admin management - super admin)
```

## Future Enhancements

Potential features for future development:
- Member attendance tracking
- Payment history and reports
- Push notifications for new enrollments
- Bulk member actions
- Export data to CSV/PDF
- Analytics dashboard with charts
- Member communication system
- Gym capacity management
- Class/session scheduling
