'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
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
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
      
      <div className="space-y-4">
        <Input
          label="Password Baru"
          name="password"
          type="password"
          required
          placeholder="Masukkan password baru"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          showPasswordToggle={true}
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
        />
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full"
      >
        {loading ? 'Memproses...' : 'Reset Password'}
      </Button>
    </form>
  );
}