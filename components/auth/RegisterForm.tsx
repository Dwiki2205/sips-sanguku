'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    telepon: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/registrasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Registrasi berhasil, langsung login
        login(data.token, data.user);
      } else {
        setError(data.error || 'Registrasi gagal');
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
      
      <div className="space-y-4">
        <Input
          label="Nama Lengkap"
          name="nama"
          type="text"
          required
          placeholder="Masukkan nama lengkap"
          value={formData.nama}
          onChange={handleChange}
          disabled={loading}
        />
        
        <Input
          label="Username"
          name="username"
          type="text"
          required
          placeholder="Pilih username"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
        />
        
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="Masukkan email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        
        <Input
          label="Nomor Telepon"
          name="telepon"
          type="tel"
          required
          placeholder="Contoh: 081234567890"
          value={formData.telepon}
          onChange={handleChange}
          disabled={loading}
        />
        
        <Input
          label="Password"
          name="password"
          type="password"
          required
          placeholder="Minimal 6 karakter"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          showPasswordToggle={true}
        />
        
        <Input
          label="Konfirmasi Password"
          name="confirmPassword"
          type="password"
          required
          placeholder="Ulangi password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
          showPasswordToggle={true}
        />
      </div>

      <div className="text-sm text-gray-600">
        <p>
          Dengan mendaftar, Anda menyetujui{' '}
          <Link href="/syarat-ketentuan" className="text-indigo-600 hover:text-indigo-500">
            Syarat & Ketentuan
          </Link>{' '}
          dan{' '}
          <Link href="/kebijakan-privasi" className="text-indigo-600 hover:text-indigo-500">
            Kebijakan Privasi
          </Link>
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link 
            href="/login" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sudah punya akun? Login
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full"
      >
        {loading ? 'Mendaftarkan...' : 'Daftar'}
      </Button>
    </form>
  );
}