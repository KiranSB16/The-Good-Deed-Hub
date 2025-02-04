import dotenv from "dotenv"
dotenv.config()
import nodemailer, { createTransport } from "nodemailer"
const transporter = nodemailer.createTransport({
    service : 'gmail',
    host : 'smtp.gmail',
    port : 587,
    secure : false,
    auth : {
        user : process.env.USER,
        pass : process.env.APP_PASSWORD
    }
})

export const notifyCauseApproval = async (fundraiser, cause) => {
    const subject = "Cause Approved!";
    const html = `
      <p>Dear ${fundraiser.name},</p>
      <p>Your cause "<strong>${cause.title}</strong>" has been approved and is now live on our platform!</p>
      <p>Thank you for your contribution to the community.</p>
      <p>Best Regards,<br>The Good Deed Hub Team</p>
    `
    // Explicitly include the recipient (to) and sender (from)
    await sendEmail({
      to: process.env.USER,
      from: `"The Good Deed Hub" <${process.env.USER}>`,
      subject,
      html,
    });
  };

  export const notifyCauseRejection = async (fundraiser, cause) => {
    const subject = "Cause Rejected";
    const html = `
      <p>Dear ${fundraiser.name},</p>
      <p>We regret to inform you that your cause "<strong>${cause.title}</strong>" has been rejected for the following reason:</p>
      <p><strong>${cause.rejectionMessage}</strong></p>
      <p>Please make the necessary changes and try submitting again.</p>
      <p>Best Regards,<br>The Good Deed Hub Team</p>
    `;
  
    // Explicitly include the recipient (to) and sender (from)
    await sendEmail({
      to: process.env.USER ,
      from: `"The Good Deed Hub" <${process.env.USER}>`,
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