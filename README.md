# Student CRM System

A comprehensive Student Customer Relationship Management (CRM) system built with React, TypeScript, and Firebase. This application provides user authentication, role-based access control, and administrative features for managing student data.

## 🚀 Features

- **User Authentication**: Secure login/registration with Firebase Auth
- **Role-Based Access Control**: Admin and regular user roles
- **Account Management**: Admin approval system for new registrations
- **Responsive Design**: Modern UI with Tailwind CSS
- **Real-time Database**: Firebase Firestore integration
- **User Management**: Admin panel for managing users and permissions

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **State Management**: React Context API
- **Routing**: React Router
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Firebase](https://firebase.google.com/) account

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/deepraj014/student-crm.git
cd student-crm
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Create a web app in your Firebase project
4. Copy your Firebase configuration

### 4. Environment Setup

Create a `.env` file in the root directory and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Firebase Security Rules

Set up Firestore security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Only admins can read all users
    match /users/{document=**} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── Admin/
│   │   └── AdminUserManagement.tsx    # Admin panel for user management
│   └── auth/
│       ├── Login.tsx                  # Login component
│       ├── Register.tsx               # Registration component
│       └── AccountPending.tsx         # Pending approval page
├── contexts/
│   └── AuthContext.tsx                # Authentication context
├── config/
│   └── firebase.ts                    # Firebase configuration
├── types/
│   └── auth.ts                        # TypeScript type definitions
├── utils/
│   └── invitations.ts                 # Utility functions
├── App.tsx                            # Main application component
└── main.tsx                           # Application entry point
```

## 🔐 Authentication System

### User Roles

- **Admin**: Full access to user management and administrative features
- **User**: Standard user access with pending approval system

### Registration Flow

1. New users register with email/password
2. Account is created with `pending` status
3. Admin reviews and approves/rejects the account
4. User receives appropriate access based on admin decision

## 🎯 Key Features

### For Admins

- View all registered users
- Approve or reject pending registrations
- Manage user roles and permissions
- Access administrative dashboard

### For Users

- Secure login/registration
- Profile management
- Role-based content access
- Responsive user interface

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Deploy to Firebase Hosting (Optional)

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login and initialize:

```bash
firebase login
firebase init hosting
```

3. Deploy:

```bash
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add proper TypeScript types
- Follow the existing code structure
- Test your changes thoroughly

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Configuration**: Ensure all environment variables are set correctly
2. **Authentication Issues**: Check Firebase Auth settings and security rules
3. **Build Errors**: Clear node_modules and reinstall dependencies

### Getting Help

- Check the [Issues](https://github.com/deepraj014/student-crm/issues) page
- Create a new issue with detailed description
- Provide error logs and steps to reproduce

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Author

- **Deep Raj Singh** - [deepraj014](https://github.com/deepraj014)

---

For more information or questions, please open an issue or contact the maintainer.
