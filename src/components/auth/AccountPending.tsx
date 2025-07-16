// src/components/auth/AccountPending.tsx - NEW FILE

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AccountPending = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect if user gets approved
  useEffect(() => {
    if (currentUser?.status === "active") {
      // User has been approved! Redirect to dashboard
      navigate("/dashboard");
    }
  }, [currentUser?.status, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Pending Icon */}
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Account Pending Approval
          </h2>

          <p className="text-gray-600 mb-6">
            Your account has been created successfully! An administrator will
            review and approve your account shortly. You'll receive an email
            notification once approved.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>What happens next?</strong>
              <br />
              • Admin reviews your registration
              <br />
              • You receive approval email
              <br />• You can then login and access the system
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Sign Out
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Questions? Contact your administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountPending;
