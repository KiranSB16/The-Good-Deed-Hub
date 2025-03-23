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
      <p><strong>${cause.rejectionReason}</strong></p>
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

// Send notification for cause completion
export const notifyCauseCompletion = async (fundraiser, cause, donorEmails) => {
  // Email to fundraiser
  const fundraiserSubject = "Congratulations! Your Cause Has Been Fully Funded";
  const fundraiserHtml = `
    <p>Dear ${fundraiser.name},</p>
    <p>We're thrilled to inform you that your cause "<strong>${cause.title}</strong>" has been fully funded!</p>
    <p>The target amount of ₹${cause.goalAmount.toLocaleString()} has been reached thanks to the generous contributions of our donors.</p>
    <p>This is a significant milestone, and we want to express our heartfelt congratulations for your successful fundraising campaign.</p>
    <p>We will now mark this cause as 'completed' on our platform. Please ensure you fulfill the purpose of this fundraiser as committed.</p>
    <p>Thank you for using our platform to create positive change.</p>
    <p>Best Regards,<br>The Good Deed Hub Team</p>
  `;

  try {
    // Send email to fundraiser
    await sendEmail({
      to: fundraiser.email,
      from: `"The Good Deed Hub" <${process.env.USER}>`,
      subject: fundraiserSubject,
      html: fundraiserHtml,
    });

    // Email to donors
    if (donorEmails && donorEmails.length > 0) {
      const donorSubject = `Success! A Cause You Supported Has Been Fully Funded`;
      const donorHtml = `
        <p>Dear Donor,</p>
        <p>We're excited to share that the cause "<strong>${cause.title}</strong>" that you generously supported has been fully funded!</p>
        <p>The goal of ₹${cause.goalAmount.toLocaleString()} has been reached, and this wouldn't have been possible without your contribution.</p>
        <p>Your generosity is making a real impact. Thank you for being part of this journey.</p>
        <p>Best Regards,<br>The Good Deed Hub Team</p>
      `;

      // Use BCC to send to all donors at once
      await sendEmail({
        to: process.env.USER, // Send to ourselves
        from: `"The Good Deed Hub" <${process.env.USER}>`,
        subject: donorSubject,
        html: donorHtml,
        bcc: donorEmails // Use BCC for multiple recipients
      });
    }

    console.log('✅ Cause completion emails sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending cause completion emails:', error);
    return false;
  }
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
  
  export const sendEmail = async ({ to, from, subject, html, bcc }) => {
    try {
      const emailOptions = { from, to, subject, html };
      
      // Add BCC if provided
      if (bcc && bcc.length > 0) {
        emailOptions.bcc = bcc;
      }
      
      const info = await transporter.sendMail(emailOptions);
      console.log(`Email sent to ${to}${bcc ? ' and ' + bcc.length + ' BCC recipients' : ''}: ${info.response}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error("Email notification failed.");
    }
  }