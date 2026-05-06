export const inviteTemplate = (inviteLink: string, email: string) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>You're invited 🎉</h2>
      <p>Hello ${email},</p>
      <p>You’ve been invited to join a project.</p>
      <a 
        href="${inviteLink}" 
        style="background: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;"
      >
        Accept Invite
      </a>
      <p>If you didn’t expect this, ignore this email.</p>
    </div>
  `;
};