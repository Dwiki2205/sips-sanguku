'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';

interface PageProps {
  params: {
    token: string;
  }
}

export default function ResetPasswordPage({ params }: PageProps) {
  const { token } = params;
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validasi
    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password berhasil direset. Anda akan diarahkan ke halaman login.');
        setFormData({ password: '', confirmPassword: '' });
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Gagal reset password');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masukkan password baru Anda
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Password Baru"
              name="password"
              type="password"
              required
              placeholder="Masukkan password baru (minimal 6 karakter)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              showPasswordToggle={true}
              minLength={6}
            />
            
            <Input
              label="Konfirmasi Password Baru"
              name="confirmPassword"
              type="password"
              required
              placeholder="Ulangi password baru"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              showPasswordToggle={true}
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Reset Password'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Kembali ke Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}