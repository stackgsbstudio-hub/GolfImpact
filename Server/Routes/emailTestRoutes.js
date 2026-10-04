import express from "express";
import { sendEmail } from "../utils/emailService.js";
import verifyToken from "../Auth/authMiddleware.js";
import adminOnly from "../Auth/adminMiddleware.js";

const router = express.Router();

router.post("/send", verifyToken, adminOnly, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const result = await sendEmail({
      to: email,

      subject: "GolfImpact Email Test",

      text: "GolfImpact email notifications are working.",

      html: `
          <div style="font-family:Arial,sans-serif;background:#09111B;padding:30px;color:#ffffff;">
            <div style="max-width:600px;margin:auto;background:#0D1520;padding:30px;border-radius:16px;">
              
              <h1 style="margin:0;color:#9A8DFF;">
                GolfImpact
              </h1>

              <p style="margin-top:25px;font-size:16px;">
                Email notifications are working successfully.
              </p>

              <p style="color:#9CA3AF;">
                Play. Win. Make a Difference.
              </p>

            </div>
          </div>
        `,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Unable to send test email.",
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully.",
    });
  } catch (error) {
    console.error("EMAIL TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send test email.",
    });
  }
});

export default router;
