export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "agent" | "student";
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    role: "agent" | "student"
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
