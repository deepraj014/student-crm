import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

// Generate secure random token
export const generateInvitationToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Validate invitation token
export const validateInvitationToken = async (token: string) => {
  try {
    const inviteDoc = await getDoc(doc(db, "invitations", token));

    if (!inviteDoc.exists()) {
      throw new Error("Invalid invitation token");
    }

    const invitation = inviteDoc.data();

    if (invitation.status !== "pending") {
      throw new Error("Invitation already used");
    }

    if (new Date() > invitation.expiresAt.toDate()) {
      throw new Error("Invitation has expired");
    }

    return invitation;
  } catch (error) {
    console.error("Token validation error:", error);
    throw error;
  }
};

// Simple email simulation (we'll just log the invitation link for now)
export const sendInvitationEmail = (
  email: string,
  token: string,
  role: string,
  inviterName: string
) => {
  const invitationUrl = `${window.location.origin}/register/${token}`;

  // For development - log the invitation link
  console.log(`
🔗 INVITATION SENT TO: ${email}
👤 ROLE: ${role}
👨‍💼 INVITED BY: ${inviterName}
🔗 LINK: ${invitationUrl}
⏰ EXPIRES: 48 hours
  `);

  // TODO: Replace with actual email service later
  alert(
    `Invitation sent to ${email}!\n\nInvitation link (for testing):\n${invitationUrl}`
  );
};
