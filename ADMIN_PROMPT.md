# FITCORE Admin Web Application - AI Development Prompt

## Project Context

You are building an admin web application for **FITCORE**, a gym management system. This web admin panel will be used by Super Admins and Gym Admins to manage gyms, users, and enrollments.

## Existing Infrastructure

### Mobile App (Already Built)
- React Native + Expo mobile app for gym members
- Firebase Authentication & Firestore database
- User roles: superAdmin, gymAdmin, member
- Enrollment workflow: gym selection → payment → approval → access

### Firebase Project Details
- **Project ID**: fitcore-ca10b
- **Collections**: users, gyms, enrollments (to be created)
- **Authentication**: Email/Password
- **Already configured** with the mobile app

---

## Your Task

Build a **React + TypeScript + TailwindCSS** admin web application with the following specifications:

---

## Technical Requirements

### Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS (matching mobile app dark theme)
- **Routing**: React Router v6
- **Backend**: Firebase (Authentication + Firestore)
- **UI Components**: Lucide React icons, React Hot Toast for notifications
- **State Management**: React Context API
- **Data Tables**: @tanstack/react-table (optional but recommended)

### Design System (Match Mobile App)
```css
Colors:
- Background: #0a0f1a (dark navy)
- Secondary Background: #0f172a
- Tertiary Background: #1e293b
- Primary Accent: #4ade80 (green)
- Text Primary: #e9eef7
- Text Secondary: #94a3b8
- Text Tertiary: #64748b

Components:
- Rounded corners: 12-24px
- Glass morphism effect on cards
- Smooth shadows with primary color glow
- Consistent spacing and padding
```

---

## Features to Implement

### 1. Authentication System

#### Login Page
- Email and password authentication
- Only allow users with role `superAdmin` or `gymAdmin`
- Show error if regular member tries to login
- Redirect to appropriate dashboard based on role
- Remember authentication state

---

### 2. Super Admin Dashboard

#### Overview Page
Display key metrics:
- Total number of gyms
- Total number of members
- Total number of gym admins
- Pending enrollment requests (across all gyms)
- Recent activity feed
- Revenue statistics (optional)

#### Gym Management Page
**CRUD Operations for Gyms:**

Create Gym:
- Form fields: name, address, phone, email, upiId, monthlyFee
- Auto-generate gymId
- Set isActive to true by default
- Option to assign a gym admin during creation

View Gyms:
- Searchable and filterable table
- Columns: Name, Address, Phone, Admin, Monthly Fee, Status, Actions
- Show gym status (Active/Inactive) with colored badge
- Pagination for large lists

Edit Gym:
- Update all gym details
- Reassign gym admin
- Toggle active/inactive status

Delete/Deactivate Gym:
- Soft delete (set isActive to false)
- Confirm before deletion
- Show warning if gym has active members

#### Admin Management Page
**CRUD Operations for Gym Admins:**

Create Admin:
- Form fields: name, email, password
- Assign to a specific gym
- Set role to 'gymAdmin'
- Send email notification (optional)

View Admins:
- Table showing: Name, Email, Assigned Gym, Created Date, Actions
- Filter by gym
- Search by name or email

Edit Admin:
- Update name, email
- Reassign to different gym
- Reset password option

Deactivate Admin:
- Disable admin account
- Remove gym assignment
- Confirm before action

---

### 3. Gym Admin Dashboard

#### Overview Page
Display metrics for their gym only:
- Total members in their gym
- Pending enrollment requests for their gym
- Today's check-ins
- This month's revenue
- Recent member activity

#### Member Management Page

**Pending Enrollments:**
- List all pending enrollment requests
- Show: Member name, email, payment method, transaction ID, amount, date
- Actions: Approve or Reject
- Add verification notes
- Filter by payment method (online/offline)

**All Members:**
- Table showing all approved members
- Columns: Name, Email, Enrollment Date, Payment Status, Last Check-in, Actions
- Search and filter options
- View member details (profile, attendance, payments)

**Member Actions:**
- View detailed member profile
- View attendance history
- View payment history
- Suspend/Reactivate membership
- Send notification to member (optional)

#### Gym Details Page
- View their gym information
- Request updates to gym details (approval from super admin)
- View gym statistics and analytics

---

## Database Schema

### Collections Structure

#### users
```typescript
{
  uid: string; // Document ID
  displayName: string;
  email: string;
  role: 'superAdmin' | 'gymAdmin' | 'member';
  gymId: string | null; // null for superAdmin
  enrollmentStatus: 'none' | 'pending' | 'approved' | 'rejected';
  paymentMethod: 'online' | 'offline' | null;
  transactionId: string | null;
  enrolledAt: Timestamp | null;
  createdAt: Timestamp;
}
```

#### gyms
```typescript
{
  id: string; // Document ID
  name: string;
  address: string;
  phone: string;
  email: string;
  upiId: string;
  monthlyFee: number;
  adminId: string; // Reference to user.uid of gym admin
  isActive: boolean;
  createdAt: Timestamp;
}
```

#### enrollments (Create this collection)
```typescript
{
  id: string; // Document ID
  userId: string;
  userName: string;
  userEmail: string;
  gymId: string;
  gymName: string;
  paymentMethod: 'online' | 'offline';
  transactionId: string | null;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  verifiedAt: Timestamp | null;
  verifiedBy: string | null; // uid of admin who approved
}
```

---

## Important Implementation Notes

### Security & Permissions

1. **Authentication:**
   - Only allow superAdmin and gymAdmin roles to access admin panel
   - Verify role on login
   - Implement protected routes

2. **Authorization:**
   - Super Admin can access all gyms and members
   - Gym Admin can only access their assigned gym's data
   - Validate user permissions on backend (Firestore Security Rules)

3. **Data Validation:**
   - Validate all form inputs
   - Sanitize user input
   - Handle errors gracefully

### Real-time Updates
- Use Firestore `onSnapshot` listeners for real-time data
- Update UI automatically when data changes
- Show loading states during operations

### User Experience
- Show loading spinners for async operations
- Display success/error toast notifications
- Confirm destructive actions (delete, reject)
- Provide helpful error messages
- Responsive design (mobile, tablet, desktop)

### Data Queries (Firestore)

**Super Admin queries:**
```typescript
// Get all gyms
const gymsRef = collection(db, 'gyms');
const gymsSnapshot = await getDocs(query(gymsRef, orderBy('createdAt', 'desc')));

// Get all admins
const adminsRef = collection(db, 'users');
const adminsSnapshot = await getDocs(query(adminsRef, where('role', '==', 'gymAdmin')));

// Get all pending enrollments
const enrollmentsRef = collection(db, 'enrollments');
const pendingSnapshot = await getDocs(query(enrollmentsRef, where('status', '==', 'pending')));
```

**Gym Admin queries:**
```typescript
// Get their gym members
const membersRef = collection(db, 'users');
const membersSnapshot = await getDocs(
  query(membersRef, 
    where('gymId', '==', currentUser.gymId),
    where('role', '==', 'member')
  )
);

// Get pending enrollments for their gym
const enrollmentsRef = collection(db, 'enrollments');
const pendingSnapshot = await getDocs(
  query(enrollmentsRef,
    where('gymId', '==', currentUser.gymId),
    where('status', '==', 'pending')
  )
);
```

---

## Page Components to Create

### 1. Common Components
- `DashboardLayout.tsx` - Sidebar navigation and header
- `StatCard.tsx` - Metric display cards
- `DataTable.tsx` - Reusable table component
- `Modal.tsx` - Reusable modal dialog
- `ConfirmDialog.tsx` - Confirmation prompts
- `LoadingSpinner.tsx` - Loading indicator

### 2. Super Admin Pages
- `SuperAdmin/Dashboard.tsx` - Overview with statistics
- `SuperAdmin/GymManagement.tsx` - CRUD for gyms
- `SuperAdmin/AdminManagement.tsx` - CRUD for admins
- `SuperAdmin/AddGymForm.tsx` - Form to add new gym
- `SuperAdmin/AddAdminForm.tsx` - Form to add new admin
- `SuperAdmin/EditGymForm.tsx` - Form to edit gym
- `SuperAdmin/EditAdminForm.tsx` - Form to edit admin

### 3. Gym Admin Pages
- `GymAdmin/Dashboard.tsx` - Gym-specific overview
- `GymAdmin/MemberManagement.tsx` - Member list and actions
- `GymAdmin/EnrollmentRequests.tsx` - Pending approval list
- `GymAdmin/MemberDetails.tsx` - Individual member view
- `GymAdmin/GymDetails.tsx` - Their gym information

### 4. Shared Pages
- `Login.tsx` - Authentication page
- `Unauthorized.tsx` - Access denied page

---

## Step-by-Step Implementation Guide

### Phase 1: Project Setup (30 minutes)
1. Create Vite + React + TypeScript project
2. Install dependencies (React Router, Firebase, TailwindCSS, etc.)
3. Configure TailwindCSS with custom theme
4. Setup Firebase configuration
5. Create folder structure

### Phase 2: Authentication (1 hour)
1. Create AuthContext with login/logout
2. Build Login page
3. Implement protected routes
4. Add role-based access control

### Phase 3: Layout & Navigation (1 hour)
1. Create DashboardLayout with sidebar
2. Add navigation based on user role
3. Implement responsive mobile menu
4. Add user profile section and logout

### Phase 4: Super Admin Features (3-4 hours)
1. Build Super Admin Dashboard with statistics
2. Implement Gym Management (CRUD)
3. Implement Admin Management (CRUD)
4. Add forms with validation
5. Create data tables with search/filter

### Phase 5: Gym Admin Features (3-4 hours)
1. Build Gym Admin Dashboard
2. Implement Member Management page
3. Create Enrollment Request approval system
4. Add member details view
5. Implement gym-specific data filtering

### Phase 6: Polish & Testing (2 hours)
1. Add loading states and error handling
2. Implement toast notifications
3. Test all CRUD operations
4. Test role-based permissions
5. Verify responsive design
6. Add confirmation dialogs

### Phase 7: Deployment (1 hour)
1. Build production bundle
2. Deploy to Firebase Hosting or Vercel
3. Configure environment variables
4. Test deployed application

---

## Sample Code Snippets

### Creating a Gym (Super Admin)
```typescript
const createGym = async (gymData: GymFormData) => {
  try {
    const gymRef = collection(db, 'gyms');
    await addDoc(gymRef, {
      name: gymData.name,
      address: gymData.address,
      phone: gymData.phone,
      email: gymData.email,
      upiId: gymData.upiId,
      monthlyFee: Number(gymData.monthlyFee),
      adminId: gymData.adminId || '',
      isActive: true,
      createdAt: serverTimestamp(),
    });
    toast.success('Gym created successfully!');
  } catch (error) {
    console.error('Error creating gym:', error);
    toast.error('Failed to create gym');
  }
};
```

### Approving Enrollment (Gym Admin)
```typescript
const approveEnrollment = async (enrollmentId: string, userId: string) => {
  try {
    // Update enrollment status
    await updateDoc(doc(db, 'enrollments', enrollmentId), {
      status: 'approved',
      verifiedAt: serverTimestamp(),
      verifiedBy: currentUser.uid,
    });

    // Update user's enrollment status
    await updateDoc(doc(db, 'users', userId), {
      enrollmentStatus: 'approved',
      enrolledAt: serverTimestamp(),
    });

    toast.success('Enrollment approved!');
  } catch (error) {
    console.error('Error approving enrollment:', error);
    toast.error('Failed to approve enrollment');
  }
};
```

### Fetching Gym Members (Gym Admin)
```typescript
useEffect(() => {
  if (!userData?.gymId) return;

  const membersRef = collection(db, 'users');
  const q = query(
    membersRef,
    where('gymId', '==', userData.gymId),
    where('role', '==', 'member'),
    where('enrollmentStatus', '==', 'approved')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const membersList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMembers(membersList);
  });

  return () => unsubscribe();
}, [userData]);
```

---

## Testing Checklist

### Super Admin
- [ ] Can login with superAdmin role
- [ ] Dashboard shows all gyms and admins count
- [ ] Can create new gym
- [ ] Can edit existing gym
- [ ] Can deactivate gym
- [ ] Can create new gym admin
- [ ] Can assign admin to gym
- [ ] Can edit admin details
- [ ] Can deactivate admin account
- [ ] Can view all members across all gyms
- [ ] Can view all pending enrollments

### Gym Admin
- [ ] Can login with gymAdmin role
- [ ] Dashboard shows only their gym's data
- [ ] Can view pending enrollments for their gym only
- [ ] Can approve enrollment requests
- [ ] Can reject enrollment requests
- [ ] Can view all approved members in their gym
- [ ] Can view member details
- [ ] Cannot access other gyms' data
- [ ] Cannot create/edit/delete gyms
- [ ] Cannot manage other admins

### Security
- [ ] Regular members cannot access admin panel
- [ ] Unauthorized users redirected to login
- [ ] Gym admins cannot access super admin routes
- [ ] Data queries filter by gymId for gym admins
- [ ] Firestore security rules enforced

---

## Figma Design Integration Note

Since you have Figma designs ready:
1. Export color palette from Figma to TailwindCSS config
2. Match component styling (buttons, cards, inputs) to Figma designs
3. Use exact spacing, typography, and border radius from designs
4. Ensure responsive breakpoints match Figma screens
5. Export icons or use similar icons from Lucide React

---

## Quick Start Command

```bash
# Create project
npm create vite@latest fitcore-admin -- --template react-ts
cd fitcore-admin

# Install dependencies
npm install firebase react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-hot-toast lucide-react @tanstack/react-table date-fns

# Start development
npm run dev
```

---

## Final Deliverables

1. ✅ Fully functional admin web application
2. ✅ Super Admin dashboard with gym and admin management
3. ✅ Gym Admin dashboard with member management
4. ✅ Enrollment approval system
5. ✅ Responsive design matching mobile app theme
6. ✅ Real-time data updates
7. ✅ Secure authentication and authorization
8. ✅ Error handling and loading states
9. ✅ Production-ready deployment

---

## Additional Resources

- Firebase Docs: https://firebase.google.com/docs/web/setup
- React Router: https://reactrouter.com/
- TailwindCSS: https://tailwindcss.com/docs
- Lucide Icons: https://lucide.dev/
- React Table: https://tanstack.com/table/

---

**Ready to build! Use this prompt with your Figma designs to create a production-ready admin panel.**
