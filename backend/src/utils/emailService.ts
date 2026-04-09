import nodemailer from 'nodemailer';
import logger from './logger';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Shared Luxury Email Wrapper
 */
const luxuryEmailTemplate = (title: string, content: string, ctaText: string, ctaUrl: string, userName: string, subtitle: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030303; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #030303; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        
        <!-- Main Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0d0d0d; border: 1px solid #221a0f; border-radius: 4px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          
          <!-- Header/Logo Area -->
          <tr>
            <td align="center" style="padding: 60px 40px 40px; border-bottom: 2px solid #1a140b;">
              <h1 style="margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 36px; font-weight: 400; letter-spacing: 12px; color: #d4af37; text-transform: uppercase;">
                VENORUM
              </h1>
              <div style="width: 40px; height: 1px; background-color: #d4af37; margin: 20px 0;"></div>
              <p style="margin: 0; font-size: 11px; letter-spacing: 5px; color: #8c734e; text-transform: uppercase; font-weight: 300;">
                Exclusive Jewellery & Timepieces
              </p>
            </td>
          </tr>

          <!-- Context Body -->
          <tr>
            <td style="padding: 50px 60px;">
              <h2 style="margin: 0 0 10px; font-family: 'Times New Roman', Times, serif; font-size: 22px; color: #d4af37; font-weight: 400; text-align: center;">
                ${subtitle}
              </h2>
              <p style="margin: 0 0 30px; font-size: 15px; color: #ffffff; text-align: center; font-weight: 300;">
                Dear ${userName},
              </p>
              
              <div style="margin: 0 0 40px; font-size: 14px; color: #a6a6a6; line-height: 1.8; text-align: center;">
                ${content}
              </div>

              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; background-color: #d4af37; color: #000000; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; padding: 20px 60px; border-radius: 2px;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link Expiry Notice -->
              <p style="margin: 40px 0 0; font-size: 11px; color: #5c5c5c; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
                * This link will remain active for 30 minutes.
              </p>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td align="center" style="padding: 40px 60px; background-color: #0a0a0a; border-top: 1px solid #1a140b;">
              <p style="margin: 0 0 15px; font-size: 10px; color: #404040; letter-spacing: 2px; text-transform: uppercase;">
                You are receiving this because you are part of the Venorum community.
              </p>
              <p style="margin: 0 0 15px; font-size: 10px; color: #404040; line-height: 1.6;">
                 Bikaner \u2022
              </p>
              <p style="margin: 0; font-size: 9px; color: #333333;">
                © ${new Date().getFullYear()} Venorum. Crafted with Distinction.
              </p>
            </td>
          </tr>

        </table>

        <!-- Unsubscribe/Plain Link fallback -->
        <table width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="margin: 0; font-size: 10px; color: #404040;">
                Trouble with the button? Copy this into your browser:<br/>
                <a href="${ctaUrl}" style="color: #8c734e; text-decoration: none;">${ctaUrl}</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * sends reset email
 */
export const sendResetPasswordEmail = async (toEmail: string, userName: string, resetUrl: string) => {
  try {
    const transporter = createTransporter();
    const html = luxuryEmailTemplate(
      "Reset Your Password",
      "We have received a request to access your Venorum account. To ensure the security of your profile, please complete your password reset by selecting the link below.",
      "Authorize Reset",
      resetUrl,
      userName,
      "Security Authorization"
    );

    await transporter.sendMail({
      from: `"Venorum" <${process.env.SMTP_EMAIL}>`,
      to: toEmail,
      subject: 'Authorize Password Reset — Venorum',
      html,
    });
    return true;
  } catch (error) {
    logger.error(`Reset email failed: ${error}`);
    return false;
  }
};

/**
 * sends verification email
 */
export const sendVerificationEmail = async (toEmail: string, userName: string, verificationUrl: string) => {
  try {
    const transporter = createTransporter();
    const html = luxuryEmailTemplate(
      "Verify Your Account",
      "Welcome to the inner circle. To finalize your membership and access the Venorum collection, we require a brief verification of your electronic correspondence address.",
      "Confirm Membership",
      verificationUrl,
      userName,
      "Membership Verification"
    );

    await transporter.sendMail({
      from: `"Venorum" <${process.env.SMTP_EMAIL}>`,
      to: toEmail,
      subject: 'Complete Your Membership — Venorum',
      html,
    });
    return true;
  } catch (error) {
    logger.error(`Verification email failed: ${error}`);
    return false;
  }
};
