// Replace your existing types/auth.ts with this:

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "agent" | "student";
  status: "active" | "pending" | "suspended";
  createdAt: Date;
  approvedAt?: Date;
  invitedBy: string;
  agentId?: string; // For students
  lastLoginAt?: Date;
}

export interface Invitation {
  token: string;
  email: string;
  role: "agent" | "student";
  invitedBy: string;
  invitedByName: string;
  expiresAt: Date;
  status: "pending" | "accepted" | "expired";
  createdAt: Date;
  agentId?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;

  // New invitation-based functions
  sendInvitation: (
    email: string,
    role: "agent" | "student",
    agentId?: string
  ) => Promise<void>;
  registerWithToken: (
    token: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
}
