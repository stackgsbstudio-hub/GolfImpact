import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!to) {
      console.warn("Email skipped: recipient not provided.");
      return {
        success: false,
        skipped: true,
      };
    }

    const info = await transporter.sendMail({
      from: {
        name: process.env.EMAIL_FROM_NAME || "GolfImpact",
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
      },

      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("EMAIL SEND ERROR:", error);

    // Email failure should not crash payment/draw/etc.
    return {
      success: false,
      error: error.message,
    };
  }
};

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

    console.log("Email server is ready.");

    return true;
  } catch (error) {
    console.error("EMAIL CONNECTION ERROR:", error);

    return false;
  }
};

export default transporter;
