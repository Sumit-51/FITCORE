# FITCORE Admin Web App - Quick Start Guide

## 📋 Overview

This repository contains documentation and resources for building an admin web application for the FITCORE gym management system. The mobile app (React Native) is already built and functional. This guide helps you create the admin panel.

---

## 📚 Documentation Files

### 1. **ADMIN_PROJECT_OVERVIEW.md**
Complete project overview including:
- Mobile app architecture
- Data models and Firebase structure
- User roles and permissions
- Design system and color palette
- Admin app requirements (Super Admin & Gym Admin features)

### 2. **ADMIN_SETUP_GUIDE.md**
Ready-to-paste code for all main files:
- Complete project setup commands
- All configuration files (tailwind, firebase, etc.)
- Type definitions
- Authentication context
- Router configuration
- Login page
- Dashboard layout component
- Firebase security rules

### 3. **ADMIN_PROMPT.md**
AI-friendly prompt for building the admin app:
- Detailed feature requirements
- Database queries and operations
- Step-by-step implementation guide
- Code snippets for common operations
- Testing checklist
- Security considerations

### 4. **MOBILE_APP_CODE_REFERENCE.md**
All main files from the mobile app for reference:
- Firebase configuration
- Type definitions
- Auth context
- Login/Signup pages
- Gym selection and member dashboard
- Key Firestore queries
- Design tokens

---

## 🚀 Quick Start

### Option 1: Build Manually

1. Read `ADMIN_PROJECT_OVERVIEW.md` to understand the system
2. Follow `ADMIN_SETUP_GUIDE.md` to copy-paste all base code
3. Implement the dashboard pages
4. Test and deploy

### Option 2: Use AI Assistant

Give your AI assistant this prompt:

```
I need to build an admin web application for FITCORE gym management system.

Please read these documentation files:
1. ADMIN_PROJECT_OVERVIEW.md - For understanding the system
2. ADMIN_SETUP_GUIDE.md - For base setup code
3. ADMIN_PROMPT.md - For detailed requirements
4. MOBILE_APP_CODE_REFERENCE.md - For reference

Build a complete React + TypeScript + TailwindCSS admin panel with:
- Super Admin dashboard (manage gyms and admins)
- Gym Admin dashboard (manage members and enrollments)
- Authentication with role-based access
- Firebase integration
- Responsive design matching the mobile app theme

Use the Figma designs I'll provide for UI implementation.
```

---

## 🎯 What You Get

### Super Admin Features
✅ Dashboard with system statistics  
✅ Create/Edit/Delete gyms  
✅ Create/Edit/Deactivate gym admins  
✅ Assign admins to gyms  
✅ View all members across all gyms  
✅ System-wide analytics  

### Gym Admin Features
✅ Dashboard with gym-specific statistics  
✅ View pending enrollment requests  
✅ Approve/Reject member enrollments  
✅ View and manage gym members  
✅ Member details and history  
✅ Gym-specific reports  

---

## 🔧 Tech Stack

**Frontend:**
- React 18+
- TypeScript
- TailwindCSS
- React Router
- Lucide React (icons)
- React Hot Toast (notifications)

**Backend:**
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting (deployment)

**Build Tool:**
- Vite

---

## 📦 Firebase Configuration

The Firebase project is already set up and shared with the mobile app:

```
Project ID: fitcore-ca10b
Collections: users, gyms
Auth: Email/Password enabled
```

See `ADMIN_SETUP_GUIDE.md` for complete Firebase configuration code.

---

## 🎨 Design System

The admin web app should match the mobile app design:

**Colors:**
- Background: `#0a0f1a` (dark navy)
- Primary: `#4ade80` (green)
- Text: `#e9eef7` (light gray)

**Style:**
- Dark theme with glass morphism
- Rounded corners (12-24px)
- Subtle shadows and glows
- Consistent spacing

All design tokens are documented in `MOBILE_APP_CODE_REFERENCE.md`.

---

## 📝 User Roles

### superAdmin
- Can create and manage gyms
- Can create and manage gym admins
- Can view all system data
- Has access to all features

### gymAdmin
- Can only access their assigned gym's data
- Can approve/reject member enrollments
- Can view and manage their gym's members
- Cannot create gyms or other admins

### member (mobile app only)
- Regular gym users
- Cannot access admin panel

---

## 🔒 Security

The documentation includes:
- Firestore security rules
- Role-based access control implementation
- Authentication flow
- Data validation guidelines

See `ADMIN_SETUP_GUIDE.md` for complete security rules.

---

## 🎓 Learning Resources

- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- TailwindCSS: https://tailwindcss.com
- Firebase: https://firebase.google.com/docs
- React Router: https://reactrouter.com

---

## 📞 Need Help?

All the code and instructions are provided in the documentation files. If you're using an AI assistant to build this:

1. Share all 4 documentation files
2. Share your Figma designs
3. Specify any custom requirements
4. The AI will build the complete admin panel

---

## ⏱️ Estimated Time

- **Manual build**: 8-12 hours
- **With AI assistance**: 2-4 hours
- **Using provided code**: 1-2 hours (mostly page implementations)

---

## ✅ What's Included vs What You Need to Build

### ✅ Already Provided (Copy-Paste Ready):
- Project setup commands
- Firebase configuration
- Type definitions
- Authentication system
- Router setup
- Login page
- Dashboard layout
- All CSS/styling

### 🔨 What You Need to Build:
- Super Admin Dashboard page
- Gym Management page (CRUD)
- Admin Management page (CRUD)
- Gym Admin Dashboard page
- Member Management page
- Enrollment approval interface
- Data tables and forms

All code snippets and patterns are provided in the documentation!

---

## 🚢 Deployment

Once built, deploy to:
- Firebase Hosting (recommended)
- Vercel
- Netlify
- Any static hosting

Build command: `npm run build`

---

**Start with `ADMIN_PROJECT_OVERVIEW.md` to understand the complete system!**
