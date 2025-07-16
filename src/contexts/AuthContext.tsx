// Replace your entire contexts/AuthContext.tsx with this:

import type { User as FirebaseUser } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import type { AuthContextType, User } from "../types/auth";
import {
  generateInvitationToken,
  sendInvitationEmail,
  validateInvitationToken,
} from "../utils/invitations"; // Fixed import path (added 's')

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

  // Get user data from Firestore
  const getUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || userData.displayName || "",
        role: userData.role,
        status: userData.status,
        createdAt: userData.createdAt?.toDate() || new Date(),
        approvedAt: userData.approvedAt?.toDate(),
        invitedBy: userData.invitedBy || "",
        agentId: userData.agentId,
        lastLoginAt: userData.lastLoginAt?.toDate(),
      };
    } else {
      throw new Error("User data not found");
    }
  };

  // Regular login
  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
    // Update last login time
    if (auth.currentUser) {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        lastLoginAt: serverTimestamp(),
      });
    }
  };

  // Send invitation
  const sendInvitation = async (
    email: string,
    role: "agent" | "student",
    agentId?: string
  ): Promise<void> => {
    if (!currentUser) throw new Error("Must be logged in to send invitations");

    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiry

    const invitation: any = {
      email,
      role,
      invitedBy: currentUser.uid,
      invitedByName: currentUser.displayName,
      expiresAt,
      status: "pending",
      createdAt: new Date(),
      token, // Only one token field
    };

    // Only add agentId if it exists (for students)
    if (role === "student" && (agentId || currentUser.role === "agent")) {
      invitation.agentId = agentId || currentUser.uid;
    }

    try {
      // Save invitation to Firestore
      await setDoc(doc(db, "invitations", token), invitation);
      console.log("Invitation saved successfully with token:", token);

      // Send email (for now just log/alert)
      sendInvitationEmail(email, token, role, currentUser.displayName);
    } catch (error) {
      console.error("Error saving invitation:", error);
      throw error;
    }
  };

  // Register with invitation token
  const registerWithToken = async (
    token: string,
    password: string,
    displayName: string
  ): Promise<void> => {
    // Validate token
    const invitation = await validateInvitationToken(token);

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      invitation.email,
      password
    );

    // Update profile
    await updateProfile(userCredential.user, { displayName });

    // Create user document in Firestore
    const userData: any = {
      email: invitation.email,
      displayName: displayName,
      role: invitation.role,
      status: invitation.role === "student" ? "active" : "pending", // Students auto-approved
      createdAt: serverTimestamp(),
      invitedBy: invitation.invitedBy,
    };

    // Only add agentId if it exists
    if (invitation.agentId) {
      userData.agentId = invitation.agentId;
    }

    await setDoc(doc(db, "users", userCredential.user.uid), userData);

    // Mark invitation as accepted
    await updateDoc(doc(db, "invitations", token), {
      status: "accepted",
    });
  };

  // Approve user (admin only)
  const approveUser = async (userId: string): Promise<void> => {
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Only admins can approve users");
    }

    await updateDoc(doc(db, "users", userId), {
      status: "active",
      approvedAt: serverTimestamp(),
    });
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
            const user = await getUserData(firebaseUser);
            setCurrentUser(user);
          } catch (error) {
            console.error("Error getting user data:", error);
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
    logout,
    loading,
    sendInvitation,
    registerWithToken,
    approveUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
