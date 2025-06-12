import type { User as FirebaseUser } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../config/firebase";
import type { AuthContextType, User } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get or create user role in Firestore
  const getUserRole = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined,
        role: userData.role,
      };
    } else {
      // New user, create with default role
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined,
        role: "agent",
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        createdAt: new Date(),
      });

      return newUser;
    }
  };

  // Email/Password Login
  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Email/Password Register
  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: "agent" | "student"
  ): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update the user's display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Create user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: userCredential.user.email,
      displayName: displayName,
      role: role,
      createdAt: new Date(),
    });
  };

  // Google Login
  const loginWithGoogle = async (): Promise<void> => {
    await signInWithPopup(auth, googleProvider);
  };

  // Logout
  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser && firebaseUser.email) {
          try {
            const user = await getUserRole(firebaseUser);
            setCurrentUser(user);
          } catch (error) {
            console.error("Error getting user role:", error);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    register,
    loginWithGoogle,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
