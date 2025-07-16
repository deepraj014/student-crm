// src/components/admin/AdminUserManagement.tsx - NEW FILE

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";

interface PendingUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: Date;
}

const AdminUserManagement = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"agent" | "student">("agent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

  const { currentUser, logout, sendInvitation, approveUser } = useAuth();

  // Listen to pending users
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("status", "==", "pending")
      // Removed orderBy to avoid index requirement
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "Firestore snapshot:",
          snapshot.docs.length,
          "pending users"
        );
        const users = snapshot.docs.map((doc) => {
          console.log("Pending user:", doc.id, doc.data());
          return {
            uid: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          };
        }) as PendingUser[];

        // Sort in JavaScript instead
        users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setPendingUsers(users);
      },
      (error) => {
        console.error("Error listening to pending users:", error);
      }
    );

    return unsubscribe;
  }, []);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      await sendInvitation(email.trim(), role);

      setSuccess(`Invitation sent to ${email}`);
      setEmail("");
    } catch (error: any) {
      console.error("Send invitation error:", error);
      setError(error.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId);
      setSuccess("User approved successfully");
    } catch (error: any) {
      console.error("Approve user error:", error);
      setError(error.message || "Failed to approve user");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Panel
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome,{" "}
                <span className="font-medium">{currentUser?.displayName}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            User Management
          </h2>
          <p className="text-gray-600">
            Send invitations and manage user accounts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Invitation Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Send Invitation
            </h3>

            <form onSubmit={handleSendInvitation} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "agent" | "student")
                  }
                >
                  <option value="agent">Agent</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Invitation"}
              </button>
            </form>
          </div>

          {/* Pending Approvals Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Approvals ({pendingUsers.length})
            </h3>

            {pendingUsers.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-500">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {user.displayName}
                        </h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Role: {user.role} • Registered:{" "}
                          {user.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApproveUser(user.uid)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserManagement;
