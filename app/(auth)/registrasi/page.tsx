import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
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
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Buat akun pelanggan untuk mulai menggunakan layanan Sanguku
          </p>
        </div>
        
        <RegisterForm />

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Dengan mendaftar, Anda akan menjadi <strong>Pelanggan</strong> dan dapat:
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Melakukan booking lapangan badminton</li>
            <li>• Mendaftar membership untuk mendapatkan benefit</li>
            <li>• Melihat riwayat booking dan status membership</li>
          </ul>
        </div>
      </div>
    </div>
  );
}