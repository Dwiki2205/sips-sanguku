// (auth)/registrasi/page.tsx
import RegisterForm from '@/components/auth/RegisterForm';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center md:justify-end p-4 sm:p-6 md:p-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/bgsanguku.png"
          alt="Sanguku Cafe"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md md:mr-32 lg:mr-36 xl:mr-44">
        <div className="backdrop-blur-lg bg-blue-600/20 rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="mt-6 text-3xl font-extrabold text-white">
              Daftar Akun Baru
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Buat akun pelanggan untuk mulai menggunakan layanan Sanguku
            </p>
          </div>

          <RegisterForm />

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-white">
            Sudah punya akun?{' '}
            <Link href="/" className="font-medium text-blue-400 hover:text-blue-300">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}