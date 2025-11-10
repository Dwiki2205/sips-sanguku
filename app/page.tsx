// app/page.tsx
import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
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

      {/* Login Card - DI KANAN, TIDAK TERLALU KIRI */}
      <div className="w-full max-w-md md:mr-32 lg:mr-36 xl:mr-44">
        <div className="backdrop-blur-lg bg-blue-600/20 rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50">
          
          {/* Header */}
          <h1 className="text-center text-3xl sm:text-4xl font-bold text-white mb-8">
            Welcome back!
          </h1>

          {/* Form */}
          <LoginForm />

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-white">
            Don’t have account?{' '}
            <a href="/registrasi" className="font-medium text-blue-600 hover:text-blue-500">
              Sign Up!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}