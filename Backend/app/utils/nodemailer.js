import dotenv from "dotenv"
dotenv.config()
import nodemailer, { createTransport } from "nodemailer"
const transporter = nodemailer.createTransport({
    service : 'gmail',
    host : 'smtp.gmail.com',
    port : 587,
    secure : false,
    auth : {
        user : process.env.USER,
        pass : process.env.APP_PASSWORD
    }
})

export const notifyCauseApproval = async (fundraiser, cause, recipientEmail) => {
    const subject = "Cause Approved!";
    const html = `
      <p>Dear ${fundraiser.name},</p>
      <p>Your cause "<strong>${cause.title}</strong>" has been approved and is now live on our platform!</p>
      <p>Thank you for your contribution to the community.</p>
      <p>Best Regards,<br>The Good Deed Hub Team</p>
    `
    await sendEmail({
      to: recipientEmail,
      from: `"The Good Deed Hub" <${process.env.USER}>`,
      subject,
      html,
    });
  };

  export const notifyCauseRejection = async (fundraiser, cause, recipientEmail) => {
    const subject = "Cause Rejected";
    const html = `
      <p>Dear ${fundraiser.name},</p>
      <p>We regret to inform you that your cause "<strong>${cause.title}</strong>" has been rejected for the following reason:</p>
      <p><strong>${cause.rejectionMessage}</strong></p>
      <p>Please make the necessary changes and try submitting again.</p>
      <p>Best Regards,<br>The Good Deed Hub Team</p>
    `;
  
    await sendEmail({
      to: recipientEmail,
      from: `"The Good Deed Hub" <${process.env.USER}>`,
      subject,
      html,
    });
  };

// Send OTP for password reset
export const sendPasswordResetOTP = async (recipientEmail, otp) => {
  const subject = "Password Reset OTP";
  const html = `
    <p>Your OTP for password reset is: <strong>${otp}</strong></p>
    <p>This OTP is valid for 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Best Regards,<br>The Good Deed Hub Team</p>
  `
  await sendEmail({
    from: `"The Good Deed Hub" <${process.env.USER}>`,
    to: recipientEmail,
    subject,
    html,
  });
};
  
  export const sendEmail = async ({ to, from, subject, html }) => {
    try {
      const info = await transporter.sendMail({ from, to, subject, html });
      console.log(`Email sent to ${to}: ${info.response}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error("Email notification failed.");
    }
  }