// @/lib/email.ts
import nodemailer from 'nodemailer';

// PERBAIKAN: createTransporter -> createTransport
const transporter = nodemailer.createTransport({
  host: process.env['EMAIL_SERVER']!, // Akses dengan bracket notation
  port: parseInt(process.env['EMAIL_PORT'] || '587'),
  secure: false,
  auth: {
    user: process.env['EMAIL_USER']!,
    pass: process.env['EMAIL_PASSWORD']!,
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env['BASE_URL']!}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env['EMAIL_FROM'] || process.env['EMAIL_USER']!,
    to: email,
    subject: 'Reset Password - SIPS Sanguku',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Reset Password SIPS Sanguku</h2>
        <p>Anda menerima email ini karena meminta reset password untuk akun SIPS Sanguku.</p>
        <p>Klik link di bawah ini untuk reset password:</p>
        <a href="${resetLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
           Reset Password
        </a>
        <p>Link ini akan kadaluarsa dalam 1 jam.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <hr style="margin: 24px 0;">
        <p style="color: #6B7280; font-size: 14px;">
          Sistem Informasi Pengelolaan Sanguku (SIPS)<br>
          Jl. Contoh No. 123, Yogyakarta
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Gagal mengirim email' };
  }
}