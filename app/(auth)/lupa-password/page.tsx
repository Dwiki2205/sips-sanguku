import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900">SIPS</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sistem Informasi Pengelolaan Sanguku
            </p>
          </Link>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            Lupa Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masukkan email untuk mendapatkan link reset password
          </p>
        </div>
        
        <ForgotPasswordForm />

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Link reset password akan dikirim ke email Anda dan berlaku selama 1 jam.
          </p>
        </div>
      </div>
    </div>
  );
}