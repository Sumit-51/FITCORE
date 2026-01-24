# FITCORE Admin Web Application - Complete Setup Guide

## Ready-to-Paste Code for All Main Files

This guide provides complete, ready-to-use code for building the FITCORE Admin Web Application. Simply copy and paste these code blocks into your project.

---

## Project Initialization

### Step 1: Create New Vite + React + TypeScript Project

```bash
npm create vite@latest fitcore-admin -- --template react-ts
cd fitcore-admin
npm install
```

### Step 2: Install Required Dependencies

```bash
# Core dependencies
npm install firebase react-router-dom

# UI and styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Additional utilities
npm install react-hot-toast lucide-react
npm install @tanstack/react-table date-fns
```

---

## Configuration Files

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4ade80',
          dark: '#22c55e',
          light: '#86efac',
        },
        dark: {
          DEFAULT: '#0a0f1a',
          secondary: '#0f172a',
          tertiary: '#1e293b',
        },
        accent: {
          blue: '#3b82f6',
          yellow: '#fbbf24',
          red: '#f87171',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-dark text-gray-100 font-sans antialiased;
  }
}

@layer components {
  .card {
    @apply bg-dark-secondary/85 backdrop-blur-sm rounded-2xl border border-white/6 p-6;
  }
  
  .btn-primary {
    @apply bg-primary hover:bg-primary-dark text-dark font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary/35;
  }
  
  .btn-secondary {
    @apply bg-dark-tertiary hover:bg-dark-tertiary/80 text-gray-100 font-semibold py-3 px-6 rounded-xl border border-white/10 transition-all duration-200;
  }
  
  .input {
    @apply bg-dark-tertiary/70 border border-white/6 text-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all;
  }
}
```

---

## Firebase Configuration

### `src/lib/firebase.ts`

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWcY83Sfnrd4hAiYtgcOhx7QEPxefExoI",
  authDomain: "fitcore-ca10b.firebaseapp.com",
  projectId: "fitcore-ca10b",
  storageBucket: "fitcore-ca10b.firebasestorage.app",
  messagingSenderId: "681434572380",
  appId: "1:681434572380:web:9a912d65ea43fe9ff22899",
  measurementId: "G-5QN8PW9M8B"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## Type Definitions

### `src/types/index.ts`

```typescript
export type UserRole = 'superAdmin' | 'gymAdmin' | 'member';
export type EnrollmentStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'online' | 'offline';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  gymId: string | null;
  enrollmentStatus: EnrollmentStatus;
  paymentMethod: PaymentMethod | null;
  transactionId: string | null;
  enrolledAt: Date | null;
  createdAt: Date;
}

export interface Gym {
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

export interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  gymId: string;
  gymName: string;
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  amount: number;
  status: EnrollmentStatus;
  createdAt: Date;
  verifiedAt: Date | null;
  verifiedBy: string | null;
}

export interface AdminUser extends UserData {
  role: 'superAdmin' | 'gymAdmin';
}
```

---

## Authentication Context

### `src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AdminUser } from '../types';

interface AuthContextType {
  user: User | null;
  userData: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: User): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Only allow superAdmin and gymAdmin roles
        if (data.role === 'superAdmin' || data.role === 'gymAdmin') {
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || data.displayName,
            role: data.role,
            gymId: data.gymId || null,
            enrollmentStatus: data.enrollmentStatus || 'none',
            paymentMethod: data.paymentMethod || null,
            transactionId: data.transactionId || null,
            enrolledAt: data.enrolledAt?.toDate() || null,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as AdminUser);
        } else {
          // Not an admin, sign out
          await signOut(auth);
          throw new Error('Unauthorized: Admin access required');
        }
      } else {
        await signOut(auth);
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          await fetchUserData(firebaseUser);
        } catch (error) {
          console.error('Auth error:', error);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserData(userCred.user);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## Router Configuration

### `src/App.tsx`

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import GymAdminDashboard from './pages/GymAdmin/Dashboard';
import GymManagement from './pages/SuperAdmin/GymManagement';
import AdminManagement from './pages/SuperAdmin/AdminManagement';
import MemberManagement from './pages/GymAdmin/MemberManagement';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: ('superAdmin' | 'gymAdmin')[];
}> = ({ children, allowedRoles }) => {
  const { userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userData.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!userData ? <Login /> : <Navigate to="/" replace />} />
      
      {/* Super Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['superAdmin', 'gymAdmin']}>
            {userData?.role === 'superAdmin' ? (
              <SuperAdminDashboard />
            ) : (
              <GymAdminDashboard />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/gyms"
        element={
          <ProtectedRoute allowedRoles={['superAdmin']}>
            <GymManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admins"
        element={
          <ProtectedRoute allowedRoles={['superAdmin']}>
            <AdminManagement />
          </ProtectedRoute>
        }
      />
      
      {/* Gym Admin Routes */}
      <Route
        path="/members"
        element={
          <ProtectedRoute allowedRoles={['gymAdmin']}>
            <MemberManagement />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<div className="min-h-screen bg-dark flex items-center justify-center text-white">Unauthorized Access</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## Login Page

### `src/pages/Login.tsx`

```typescript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Dumbbell } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-blue/6 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="card w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/40">
            <Dumbbell className="w-10 h-10 text-dark" />
          </div>
          <h1 className="text-4xl font-black text-gray-100 tracking-wider">FITCORE</h1>
          <p className="text-gray-400 mt-2">Admin Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="admin@fitcore.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Admin access only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

---

## Dashboard Layout Component

### `src/components/Layout/DashboardLayout.tsx`

```typescript
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  Building2,
  UserCog,
  Menu,
  X,
  LogOut,
  Dumbbell,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: ('superAdmin' | 'gymAdmin')[];
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" />, roles: ['superAdmin', 'gymAdmin'] },
    { name: 'Gyms', path: '/gyms', icon: <Building2 className="w-5 h-5" />, roles: ['superAdmin'] },
    { name: 'Admins', path: '/admins', icon: <UserCog className="w-5 h-5" />, roles: ['superAdmin'] },
    { name: 'Members', path: '/members', icon: <Users className="w-5 h-5" />, roles: ['gymAdmin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    userData && item.roles.includes(userData.role)
  );

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-secondary rounded-lg border border-white/10"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dark-secondary border-r border-white/10 transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-dark" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-100 tracking-wide">FITCORE</h1>
              <p className="text-xs text-gray-400">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-dark font-semibold'
                    : 'text-gray-300 hover:bg-dark-tertiary hover:text-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-200">{userData?.displayName}</p>
            <p className="text-xs text-gray-400">{userData?.email}</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded">
              {userData?.role === 'superAdmin' ? 'Super Admin' : 'Gym Admin'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
```

---

## Main Entry Point

### `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FITCORE Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Running the Application

```bash
# Install dependencies (if not done already)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Firebase Security Rules (Important!)

Add these security rules to your Firebase Console:

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to get user data
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Helper function to check if user is super admin
    function isSuperAdmin() {
      return isSignedIn() && getUserData().role == 'superAdmin';
    }
    
    // Helper function to check if user is gym admin
    function isGymAdmin() {
      return isSignedIn() && getUserData().role == 'gymAdmin';
    }
    
    // Helper function to check if user is admin of specific gym
    function isGymAdminOf(gymId) {
      return isGymAdmin() && getUserData().gymId == gymId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSuperAdmin() || (isGymAdmin() && resource.data.gymId == getUserData().gymId) || request.auth.uid == userId;
      allow create: if isSuperAdmin();
      allow update: if isSuperAdmin() || request.auth.uid == userId;
      allow delete: if isSuperAdmin();
    }
    
    // Gyms collection
    match /gyms/{gymId} {
      allow read: if isSignedIn();
      allow create: if isSuperAdmin();
      allow update: if isSuperAdmin() || isGymAdminOf(gymId);
      allow delete: if isSuperAdmin();
    }
    
    // Enrollments collection
    match /enrollments/{enrollmentId} {
      allow read: if isSuperAdmin() || (isGymAdmin() && resource.data.gymId == getUserData().gymId);
      allow create: if isSignedIn();
      allow update: if isSuperAdmin() || (isGymAdmin() && resource.data.gymId == getUserData().gymId);
      allow delete: if isSuperAdmin();
    }
  }
}
```

---

## Environment Variables (Optional)

Create `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=AIzaSyAWcY83Sfnrd4hAiYtgcOhx7QEPxefExoI
VITE_FIREBASE_AUTH_DOMAIN=fitcore-ca10b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fitcore-ca10b
VITE_FIREBASE_STORAGE_BUCKET=fitcore-ca10b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=681434572380
VITE_FIREBASE_APP_ID=1:681434572380:web:9a912d65ea43fe9ff22899
VITE_FIREBASE_MEASUREMENT_ID=G-5QN8PW9M8B
```

Then update `src/lib/firebase.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

---

## Next Steps

1. Copy all the code above into your project structure
2. Implement the dashboard pages (SuperAdmin/Dashboard, GymAdmin/Dashboard, etc.)
3. Create forms for managing gyms, admins, and members
4. Add data tables with sorting and filtering
5. Implement real-time updates using Firestore listeners
6. Add analytics and reporting features
7. Test thoroughly with different user roles
8. Deploy to Firebase Hosting or Vercel

---

**Complete file structure created. All code is ready to paste!**
