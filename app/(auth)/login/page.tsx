import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
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
            Login ke Akun Anda
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masukkan username dan password untuk mengakses sistem
          </p>
        </div>
        
        <LoginForm />

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Fitur Baru</span>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>🔒 Klik icon mata untuk melihat/menyembunyikan password</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Akun Demo</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-center text-gray-600">
            <div><strong>Owner:</strong> username: <code>owner</code> | password: <code>admin123</code></div>
            <div><strong>Pegawai:</strong> username: <code>pegawai</code> | password: <code>pegawai123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}