# Academia App - Replit Setup Documentation

## Overview
Academia App is a React Native/Expo application that supports multiple platforms including web, iOS, and Android. This is a comprehensive gym/academy management system built with React Native, Expo, and Firebase.

## Project Architecture
- **Framework**: Expo React Native (v53.0.22)
- **Platform Support**: Web, iOS, Android
- **Backend**: Firebase (Firestore, Auth)
- **Navigation**: React Navigation (v7.x)
- **UI Libraries**: React Native Paper, React Native Elements
- **Additional Features**: QR Code generation/scanning, Calendar, Notifications, Image Picker

## Current State
- ✅ Dependencies installed successfully
- ✅ Expo Metro bundler configured for Replit proxy environment
- ✅ Web development workflow configured on port 5000
- ✅ Firebase configuration present with existing project credentials
- 🔄 Web application currently building/bundling

## Key Configuration Changes Made
1. **Metro Configuration**: Enhanced `metro.config.js` with CORS headers for Replit proxy support
2. **Workflow Setup**: Configured Expo web server to run on port 5000 for Replit environment
3. **Development Dependencies**: Added `@expo/cli` for proper Expo tooling
4. **New Components**: Created reusable ActionButton component for consistent admin UI
5. **Enhanced Navigation**: Added screens for physical evaluations, injury management, and password changes

## Firebase Setup
The app uses Firebase with the following services:
- **Authentication**: User login/registration system
- **Firestore**: Database for storing app data
- **Project ID**: `academia-app-5cf79`

## File Structure
```
/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens (admin, instructor, student, auth)
│   ├── services/       # Firebase and other service integrations
│   ├── contexts/       # React contexts for state management
│   ├── navigation/     # Navigation configuration
│   ├── utils/          # Utility functions and theme
│   └── hooks/          # Custom React hooks
├── assets/             # Images and static assets
├── docs/               # Project documentation
└── scripts/            # Build and utility scripts
```

## Recent Changes (Sept 9, 2025)
- Set up Replit environment compatibility
- Configured Metro bundler for proper host handling
- Established web development workflow
- Verified Firebase configuration
- ✅ Implemented social login system (Google, Facebook, Apple, Microsoft)
- ✅ Added age-based class categorization (Kids 1-3, Juvenil, Adulto)
- ✅ Created secure password change functionality
- ✅ Built comprehensive physical evaluation system with BMI calculation
- ✅ Developed complete injury tracking system for students
- ✅ Enhanced admin UI with modern ActionButton component system
- ✅ Implemented professional email invitation system with SendGrid integration
- ✅ Created comprehensive LGPD privacy policy screen with legal compliance

## User Preferences
- Project follows existing code structure and conventions
- Firebase integration maintained as-is
- Multi-platform support preserved

## Development Notes
- Web server accessible at port 5000 in Replit environment
- Metro bundler configured to handle Replit's proxy setup
- All existing Firebase credentials and project configuration maintained