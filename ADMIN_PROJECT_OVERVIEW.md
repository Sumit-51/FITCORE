# FITCORE - Gym Management System

## Project Overview

**FITCORE** is a comprehensive gym management system consisting of a React Native mobile application for gym members and an admin web interface for managing gyms and users.

### Current Mobile App (React Native + Expo)

The mobile app is built with:
- **Framework**: React Native with Expo (~54.0.27)
- **Navigation**: Expo Router (file-based routing)
- **UI Styling**: NativeWind (TailwindCSS for React Native) + Gluestack UI
- **Backend**: Firebase (Authentication + Firestore)
- **State Management**: React Context API
- **Language**: TypeScript

### Technology Stack
- React 19.1.0
- React Native 0.81.5
- Expo SDK ~54
- Firebase 12.7.0
- TypeScript 5.9.2
- TailwindCSS (via NativeWind)

---

## Application Architecture

### User Roles

The system supports three user roles:

1. **superAdmin** - Can add/manage gym admins and view all system data
2. **gymAdmin** - Can manage their specific gym and view/approve members
3. **member** - Regular gym users who can check-in, view attendance, etc.

### Data Models

#### User Data Structure
```typescript
interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'superAdmin' | 'gymAdmin' | 'member';
  gymId: string | null;
  enrollmentStatus: 'none' | 'pending' | 'approved' | 'rejected';
  paymentMethod: 'online' | 'offline' | null;
  transactionId: string | null;
  enrolledAt: Date | null;
  createdAt: Date;
}
```

#### Gym Data Structure
```typescript
interface Gym {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  upiId: string;
  monthlyFee: number;
  createdAt: Date;
  adminId: string;
  isActive: boolean;
}
```

#### Enrollment Data Structure
```typescript
interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  gymId: string;
  gymName: string;
  paymentMethod: 'online' | 'offline';
  transactionId: string | null;
  amount: number;
  status: 'none' | 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  verifiedAt: Date | null;
  verifiedBy: string | null;
}
```

---

## Firebase Configuration

### Environment Variables
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAWcY83Sfnrd4hAiYtgcOhx7QEPxefExoI
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=fitcore-ca10b.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=fitcore-ca10b
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=fitcore-ca10b.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=681434572380
EXPO_PUBLIC_FIREBASE_APP_ID=1:681434572380:web:9a912d65ea43fe9ff22899
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-5QN8PW9M8B
```

### Firestore Collections Structure

1. **users** collection
   - Document ID: Firebase Auth UID
   - Fields: displayName, email, role, gymId, enrollmentStatus, paymentMethod, transactionId, enrolledAt, createdAt

2. **gyms** collection
   - Document ID: Auto-generated
   - Fields: name, address, phone, email, upiId, monthlyFee, adminId, isActive, createdAt

3. **enrollments** collection (suggested for admin)
   - Document ID: Auto-generated
   - Fields: userId, userName, userEmail, gymId, gymName, paymentMethod, transactionId, amount, status, createdAt, verifiedAt, verifiedBy

---

## Mobile App User Flow

### 1. Authentication Flow
- **Landing Page** (`app/index.tsx`): Welcome screen with login/signup options
- **Login** (`app/login.tsx`): Email/password authentication
- **Signup** (`app/signup.tsx`): New user registration

### 2. Member Enrollment Flow
1. **Gym Selection** (`app/(auth)/gym-selection.tsx`): Choose a gym from available options
2. **Payment Options** (`app/(auth)/payment-options.tsx`): Select payment method (online/offline)
3. **Pending Approval** (`app/(auth)/pending-approval.tsx`): Wait for admin approval
4. **Member Dashboard** (`app/(member)/home.tsx`): Access after approval

### 3. Member Features (Post-Approval)
- **Home** (`app/(member)/home.tsx`): Dashboard with check-in/out, stats
- **Attendance** (`app/(member)/attendance.tsx`): View attendance history
- **Payments** (`app/(member)/payments.tsx`): Payment history and dues
- **Profile** (`app/(member)/profile.tsx`): User profile management

---

## Key Application Files

### 1. Firebase Configuration (`app/lib/firebase.ts`)
Initializes Firebase app with environment variables and exports auth and db instances.

### 2. Auth Context (`app/context/AuthContext.tsx`)
Manages authentication state, user data fetching, and provides:
- `user`: Firebase Auth user object
- `userData`: User data from Firestore
- `loading`: Loading state
- `logout()`: Logout function
- `refreshUserData()`: Refresh user data function

### 3. Root Layout (`app/_layout.tsx`)
Wraps the entire app with:
- AuthProvider
- GluestackUIProvider
- Expo Router Stack navigation

### 4. Type Definitions (`app/types/index.ts`)
Defines all TypeScript interfaces for type safety.

---

## Design System

### Color Palette
- **Primary Background**: `#0a0f1a` (Dark navy)
- **Card Background**: `rgba(15, 23, 42, 0.85)` (Transparent dark blue)
- **Primary Accent**: `#4ade80` (Green)
- **Secondary Accent**: `#3b82f6` (Blue)
- **Warning Accent**: `#fbbf24` (Yellow)
- **Danger Accent**: `#f87171` (Red)
- **Text Primary**: `#e9eef7` (Light gray)
- **Text Secondary**: `#94a3b8` (Medium gray)
- **Text Tertiary**: `#64748b` (Dark gray)

### Typography
- Brand Name: 900 weight, 36-46px, letter-spacing: 4-5px
- Headers: 700-800 weight, 24-30px
- Body: 400-600 weight, 14-16px

### Component Patterns
- Rounded corners: 14-24px border radius
- Glass morphism: Semi-transparent backgrounds with blur
- Elevated cards: Subtle shadows and borders
- Accent circles: Decorative background elements

---

## Admin Web Application Requirements

### Required Features

#### Super Admin Dashboard
1. **Gym Management**
   - Add new gym
   - Edit gym details
   - Activate/deactivate gyms
   - Assign gym admins
   - View all gyms list

2. **Admin Management**
   - Create gym admin accounts
   - Assign admins to gyms
   - View all admins
   - Deactivate admin accounts

3. **System Overview**
   - Total gyms count
   - Total members count
   - Total revenue statistics
   - Recent activity feed

#### Gym Admin Dashboard
1. **Member Management**
   - View pending enrollment requests
   - Approve/reject enrollments
   - View all gym members
   - View member details
   - Deactivate memberships

2. **Gym Details**
   - View gym information
   - Update gym details (limited)
   - View gym statistics

3. **Reports**
   - Monthly revenue
   - Member attendance statistics
   - New member registrations
   - Payment collections

---

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Validate user input

### Security Considerations
- Implement role-based access control
- Validate user permissions on backend
- Sanitize user input
- Use Firebase Security Rules
- Implement proper authentication checks
- Store sensitive data securely

### UI/UX Guidelines
- Maintain consistent design language with mobile app
- Ensure responsive design (mobile, tablet, desktop)
- Provide clear feedback for user actions
- Implement proper loading indicators
- Handle error states gracefully
- Follow accessibility standards

---

## Next Steps for Admin Web App

1. **Setup React Web Application**
   - Initialize with Vite + React + TypeScript
   - Configure TailwindCSS
   - Setup Firebase SDK for web
   - Implement routing (React Router)

2. **Authentication System**
   - Login page for admins
   - Role-based route protection
   - Session management

3. **Super Admin Interface**
   - Dashboard overview
   - Gym management CRUD
   - Admin management CRUD
   - Analytics and reports

4. **Gym Admin Interface**
   - Dashboard overview
   - Member enrollment approval
   - Member management
   - Gym-specific reports

5. **Shared Components**
   - Navigation sidebar
   - Header with user menu
   - Data tables with sorting/filtering
   - Forms with validation
   - Modal dialogs
   - Toast notifications

6. **Deployment**
   - Build optimization
   - Environment configuration
   - Firebase hosting or Vercel deployment
   - Domain setup

---

## Support and Resources

- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://react.dev
- TailwindCSS: https://tailwindcss.com
- TypeScript: https://www.typescriptlang.org

---

**Last Updated**: January 2026
