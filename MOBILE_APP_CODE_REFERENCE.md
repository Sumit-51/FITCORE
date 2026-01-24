# FITCORE Mobile App - Main Files Reference

This document contains all the main code files from the FITCORE mobile application for your reference when building the admin web application.

---

## 1. Firebase Configuration

### `app/lib/firebase.ts`

```typescript
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 2. Type Definitions

### `app/types/index.ts`

```typescript
export type UserRole = 'superAdmin' | 'gymAdmin' | 'member';
export type EnrollmentStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'online' | 'offline';

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
```

---

## 3. Authentication Context

### `app/context/AuthContext.tsx`

```typescript
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { EnrollmentStatus, UserData, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserData = async (firebaseUser: User): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || data.displayName,
          role: data.role || 'member',
          gymId: data.gymId || null,
          enrollmentStatus: data.enrollmentStatus || 'none',
          paymentMethod: data.paymentMethod || null,
          transactionId: data.transactionId || null,
          enrolledAt: data.enrolledAt?.toDate() || null,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      } else {
        // Create new user document
        const newUserData = {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          role: 'member' as UserRole,
          gymId: null,
          enrollmentStatus: 'none' as EnrollmentStatus,
          paymentMethod: null,
          transactionId: null,
          enrolledAt: null,
          createdAt: serverTimestamp(),
        };

        await setDoc(userDocRef, newUserData);

        setUserData({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: 'member',
          gymId: null,
          enrollmentStatus: 'none',
          paymentMethod: null,
          transactionId: null,
          enrolledAt: null,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (user) {
      await fetchUserData(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 4. Root Layout

### `app/_layout.tsx`

```typescript
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from './context/AuthContext';

const RootLayout: React.FC = () => {
  return (
    <AuthProvider>
      <GluestackUIProvider mode="dark">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(member)" />
        </Stack>
      </GluestackUIProvider>
    </AuthProvider>
  );
};

export default RootLayout;
```

---

## 5. Login Page

### `app/login.tsx`

Key features:
- Email/password authentication
- Role-based routing after login
- Error handling with user-friendly messages
- Responsive design

```typescript
// Main login handler
const handleLogin = async (): Promise<void> => {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    setErrorText('Please enter email and password.');
    return;
  }
  if (!isEmailValid(trimmedEmail)) {
    setErrorText('Please enter a valid email address.');
    return;
  }
  try {
    setLoading(true);
    setErrorText('');
    
    const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    
    // Fetch user data to check enrollment status
    const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      if (userData.enrollmentStatus === 'approved') {
        // User is approved, go to member dashboard
        router.replace('/(member)/home' as any);
      } else if (userData.enrollmentStatus === 'pending') {
        // User has pending enrollment
        router.replace('/(auth)/pending-approval' as any);
      } else {
        // User needs to select gym
        router.replace('/(auth)/gym-selection' as any);
      }
    } else {
      // New user, needs to select gym
      router.replace('/(auth)/gym-selection' as any);
    }
  } catch (err: any) {
    setErrorText(errorMessage(err?.code));
  } finally {
    setLoading(false);
  }
};
```

---

## 6. Signup Page

### `app/signup.tsx`

Key features:
- Create new user account
- Store user data in Firestore
- Auto-redirect to gym selection

```typescript
const handleSignup = async (): Promise<void> => {
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();

  if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
    setErrorText('Please fill all fields.');
    return;
  }
  if (!isEmailValid(trimmedEmail)) {
    setErrorText('Please enter a valid email address.');
    return;
  }
  if (password.length < 6) {
    setErrorText('Use at least 6 characters for password.');
    return;
  }
  if (password !== confirmPassword) {
    setErrorText('Passwords do not match.');
    return;
  }

  try {
    setLoading(true);
    setErrorText('');

    // Create user in Firebase Auth
    const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);

    // Update display name
    if (userCred.user) {
      await updateProfile(userCred.user, { displayName: trimmedName });
    }

    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCred.user.uid), {
      displayName: trimmedName,
      email: trimmedEmail,
      role: 'member',
      gymId: null,
      enrollmentStatus: 'none',
      paymentMethod: null,
      transactionId: null,
      enrolledAt: null,
      createdAt: serverTimestamp(),
    });

    // New user, needs to select gym
    router.replace('/(auth)/gym-selection' as any);
  } catch (err: any) {
    setErrorText(errorMessage(err?.code));
  } finally {
    setLoading(false);
  }
};
```

---

## 7. Gym Selection Page

### `app/(auth)/gym-selection.tsx`

Key features:
- Fetch active gyms from Firestore
- Display gyms in a list
- Allow user to select a gym
- Navigate to payment options

```typescript
const GymSelection: React.FC = () => {
  const router = useRouter();
  const { userData, logout } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async (): Promise<void> => {
    try {
      const gymsQuery = query(
        collection(db, 'gyms'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(gymsQuery);
      const gymsList: Gym[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Gym[];

      setGyms(gymsList);
    } catch (error) {
      console.error('Error fetching gyms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (): void => {
    if (selectedGym) {
      router.push({
        pathname: '/(auth)/payment-options',
        params: {
          gymId: selectedGym.id,
          gymName: selectedGym.name,
          monthlyFee: selectedGym.monthlyFee.toString(),
          upiId: selectedGym.upiId,
        },
      });
    }
  };

  // ... rest of the component
};
```

---

## 8. Member Dashboard

### `app/(member)/home.tsx`

Key features:
- Check-in/Check-out functionality
- Display user stats
- Show membership information
- Gym information

```typescript
const MemberHome: React.FC = () => {
  const { userData } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);

  const handleCheckInOut = (): void => {
    setIsCheckedIn(!isCheckedIn);
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userData?.displayName || 'Member'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#e9eef7" />
          </TouchableOpacity>
        </View>

        {/* Gym Card */}
        <View style={styles.gymCard}>
          <Ionicons name="barbell-outline" size={24} color="#4ade80" />
          <View style={styles.gymInfo}>
            <Text style={styles.gymName}>FitCore Gym</Text>
            <Text style={styles.gymAddress}>123 Fitness Street, City</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Open</Text>
          </View>
        </View>

        {/* Check In/Out Button */}
        <TouchableOpacity
          style={[styles.checkInBtn, isCheckedIn && styles.checkOutBtn]}
          onPress={handleCheckInOut}
        >
          <View style={styles.checkInIconContainer}>
            <Ionicons
              name={isCheckedIn ? 'exit-outline' : 'enter-outline'}
              size={40}
              color="#0a0f1a"
            />
          </View>
          <Text style={styles.checkInText}>
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </Text>
          <Text style={styles.checkInSubtext}>
            {isCheckedIn ? 'Tap to end your session' : 'Tap to start your workout'}
          </Text>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={28} color="#f97316" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={28} color="#3b82f6" />
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={28} color="#a855f7" />
            <Text style={styles.statNumber}>1.5h</Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
        </View>

        {/* Membership Card */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipHeader}>
            <Text style={styles.membershipTitle}>Membership Status</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.membershipDetails}>
            <View style={styles.membershipRow}>
              <Text style={styles.membershipLabel}>Plan</Text>
              <Text style={styles.membershipValue}>Monthly Premium</Text>
            </View>
            <View style={styles.membershipRow}>
              <Text style={styles.membershipLabel}>Expires</Text>
              <Text style={styles.membershipValue}>Jan 31, 2026</Text>
            </View>
            <View style={styles.membershipRow}>
              <Text style={styles.membershipLabel}>Days Left</Text>
              <Text style={[styles.membershipValue, { color: '#4ade80' }]}>30 days</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
```

---

## 9. Package.json

### `package.json`

```json
{
  "name": "fitcorea",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-navigation/native": "^7.1.8",
    "expo": "~54.0.27",
    "expo-router": "~6.0.17",
    "firebase": "^12.7.0",
    "nativewind": "^4.1.23",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.0",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.9.2"
  }
}
```

---

## 10. Environment Variables

### `.env`

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAWcY83Sfnrd4hAiYtgcOhx7QEPxefExoI
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=fitcore-ca10b.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=fitcore-ca10b
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=fitcore-ca10b.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=681434572380
EXPO_PUBLIC_FIREBASE_APP_ID=1:681434572380:web:9a912d65ea43fe9ff22899
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-5QN8PW9M8B
```

---

## User Flow Summary

### New User Flow:
1. **Landing Page** → Login or Signup
2. **Signup** → Creates account → Auto-redirect to Gym Selection
3. **Gym Selection** → Choose gym → Continue to Payment
4. **Payment Options** → Select method → Submit enrollment
5. **Pending Approval** → Wait for admin approval
6. **Member Dashboard** → Access after approval

### Returning User Flow:
1. **Login** → Check enrollment status
   - If `approved`: Go to Member Dashboard
   - If `pending`: Go to Pending Approval
   - If `none`: Go to Gym Selection

### Admin User Flow (For Admin Web App):
1. **Login** (Admin Web) → Verify admin role
   - If `superAdmin`: Go to Super Admin Dashboard
   - If `gymAdmin`: Go to Gym Admin Dashboard
2. **Super Admin**: Manage all gyms, admins, and view all data
3. **Gym Admin**: Manage their gym's members and enrollments

---

## Key Firestore Queries for Admin

### Get All Gyms (Super Admin)
```typescript
const gymsRef = collection(db, 'gyms');
const q = query(gymsRef, orderBy('createdAt', 'desc'));
const snapshot = await getDocs(q);
```

### Get Gym Admins (Super Admin)
```typescript
const usersRef = collection(db, 'users');
const q = query(usersRef, where('role', '==', 'gymAdmin'));
const snapshot = await getDocs(q);
```

### Get Gym Members (Gym Admin)
```typescript
const usersRef = collection(db, 'users');
const q = query(
  usersRef,
  where('gymId', '==', adminGymId),
  where('role', '==', 'member'),
  where('enrollmentStatus', '==', 'approved')
);
const snapshot = await getDocs(q);
```

### Get Pending Enrollments (Gym Admin)
```typescript
const usersRef = collection(db, 'users');
const q = query(
  usersRef,
  where('gymId', '==', adminGymId),
  where('enrollmentStatus', '==', 'pending')
);
const snapshot = await getDocs(q);
```

---

## Design Tokens (For Web Admin Consistency)

```javascript
const colors = {
  dark: {
    primary: '#0a0f1a',
    secondary: '#0f172a',
    tertiary: '#1e293b',
  },
  primary: {
    DEFAULT: '#4ade80',
    dark: '#22c55e',
    light: '#86efac',
  },
  accent: {
    blue: '#3b82f6',
    yellow: '#fbbf24',
    red: '#f87171',
    orange: '#f97316',
    purple: '#a855f7',
  },
  text: {
    primary: '#e9eef7',
    secondary: '#94a3b8',
    tertiary: '#64748b',
  }
};

const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
};

const borderRadius = {
  sm: '0.75rem',  // 12px
  md: '0.875rem', // 14px
  lg: '1rem',     // 16px
  xl: '1.25rem',  // 20px
  '2xl': '1.5rem', // 24px
};
```

---

**All main files documented. Use this as reference when building the admin web application!**
