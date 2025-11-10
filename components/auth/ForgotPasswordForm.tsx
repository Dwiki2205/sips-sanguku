'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/lupa-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Link reset password telah dikirim ke email Anda');
        setEmail('');
      } else {
        setError(data.error || 'Gagal mengirim email reset password');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
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
          label="Email"
          name="email"
          type="email"
          required
          placeholder="Masukkan email terdaftar"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="text-sm text-gray-600">
        <p>
          Masukkan email yang terdaftar. Kami akan mengirimkan link untuk reset password.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link 
            href="/" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Kembali ke login
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full"
      >
        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
      </Button>
    </form>
  );
}