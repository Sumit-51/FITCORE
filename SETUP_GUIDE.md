# Admin Setup Guide

## Quick Setup for Testing

### 1. Create Test Users in Firebase

To test the admin functionality, you'll need to create users with different roles in Firebase.

#### Firebase Console Steps:

1. Go to Firebase Console → Authentication
2. Add users with different email addresses
3. Go to Firestore Database
4. Update the `users` collection for each user

### 2. User Role Configuration

#### Super Admin User
```json
{
  "email": "superadmin@fitcore.com",
  "displayName": "Super Admin",
  "role": "superAdmin",
  "gymId": null,
  "enrollmentStatus": "none",
  "paymentMethod": null,
  "transactionId": null,
  "enrolledAt": null,
  "createdAt": "2024-01-24T00:00:00Z"
}
```

#### Gym Admin User
```json
{
  "email": "admin@gym1.com",
  "displayName": "Gym 1 Admin",
  "role": "gymAdmin",
  "gymId": "gym1_id_here",
  "enrollmentStatus": "none",
  "paymentMethod": null,
  "transactionId": null,
  "enrolledAt": null,
  "createdAt": "2024-01-24T00:00:00Z"
}
```

#### Member User (Approved)
```json
{
  "email": "member@example.com",
  "displayName": "John Doe",
  "role": "member",
  "gymId": "gym1_id_here",
  "enrollmentStatus": "approved",
  "paymentMethod": "online",
  "transactionId": "TXN123456",
  "enrolledAt": "2024-01-24T00:00:00Z",
  "createdAt": "2024-01-24T00:00:00Z"
}
```

### 3. Create Sample Gym

In the `gyms` collection, create a document:

```json
{
  "name": "FitCore Gym Downtown",
  "address": "123 Fitness Street, Downtown, City - 12345",
  "phone": "+1234567890",
  "email": "downtown@fitcore.com",
  "upiId": "fitcore@upi",
  "monthlyFee": 1500,
  "adminId": "gym_admin_uid_here",
  "isActive": true,
  "createdAt": "2024-01-24T00:00:00Z"
}
```

### 4. Create Sample Enrollments

In the `enrollments` collection:

#### Pending Enrollment
```json
{
  "userId": "member_uid_here",
  "userName": "Jane Smith",
  "userEmail": "jane@example.com",
  "gymId": "gym1_id_here",
  "gymName": "FitCore Gym Downtown",
  "paymentMethod": "online",
  "transactionId": "TXN789012",
  "amount": 1500,
  "status": "pending",
  "createdAt": "2024-01-24T00:00:00Z",
  "verifiedAt": null,
  "verifiedBy": null
}
```

#### Approved Enrollment
```json
{
  "userId": "member_uid_here",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "gymId": "gym1_id_here",
  "gymName": "FitCore Gym Downtown",
  "paymentMethod": "online",
  "transactionId": "TXN123456",
  "amount": 1500,
  "status": "approved",
  "createdAt": "2024-01-20T00:00:00Z",
  "verifiedAt": "2024-01-21T00:00:00Z",
  "verifiedBy": "gym_admin_uid_here"
}
```

### 5. Testing Different Roles

#### Test as Super Admin
1. Login with super admin credentials
2. You should see the super admin dashboard with system-wide stats
3. Navigate to "Gyms" tab to see all gyms
4. Navigate to "Admins" tab to see all gym administrators
5. Test activating/deactivating gyms

#### Test as Gym Admin
1. Login with gym admin credentials
2. You should see the gym admin dashboard with your gym's stats
3. Navigate to "Members" tab to see enrollment requests
4. Test approving/rejecting enrollments
5. Navigate to "Settings" tab to update gym information

#### Test as Member
1. Login with member credentials
2. If approved, you should see the member dashboard
3. If pending, you should see the pending approval screen
4. If not enrolled, you should see the gym selection screen

### 6. Firebase Security Rules

Make sure your Firestore security rules allow proper access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Gyms - read by all authenticated users
    match /gyms/{gymId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superAdmin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'gymAdmin');
    }
    
    // Enrollments - read by gym admins and super admin
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superAdmin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'gymAdmin');
    }
  }
}
```

### 7. Environment Variables

Ensure your `.env` file has the correct Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 8. Common Issues and Solutions

#### Issue: User not being routed to correct dashboard
**Solution**: Check the user's role in Firestore. Make sure it's exactly 'member', 'gymAdmin', or 'superAdmin' (case-sensitive).

#### Issue: Gym admin can't see enrollments
**Solution**: Ensure the gym admin's `gymId` matches the gym document ID in Firestore.

#### Issue: Member stuck on pending approval
**Solution**: Have a gym admin approve the enrollment request, or manually update the enrollment status to 'approved' in Firestore.

#### Issue: Super admin tabs not showing
**Solution**: Verify the user's role is set to 'superAdmin' in the users collection.

### 9. Production Deployment

Before deploying to production:

1. Update Firebase security rules to restrict access appropriately
2. Set up proper authentication flows
3. Implement email verification
4. Add error logging and monitoring
5. Test all user flows thoroughly
6. Set up backup procedures for Firestore data
7. Configure proper access controls for Firebase console

### 10. Support

For additional help:
- Check the `ADMIN_DASHBOARD.md` file for detailed feature documentation
- Review the Firebase documentation for authentication and Firestore
- Check the Expo documentation for React Native development

## Quick Test Checklist

- [ ] Super admin can view all gyms
- [ ] Super admin can view all admins
- [ ] Super admin can activate/deactivate gyms
- [ ] Gym admin can view their gym's members
- [ ] Gym admin can approve/reject enrollments
- [ ] Gym admin can update gym settings
- [ ] Member with approved status can access member dashboard
- [ ] Member with pending status sees pending screen
- [ ] Member without enrollment can select gym
- [ ] Role-based routing works correctly
- [ ] Users cannot access unauthorized screens
