'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending login request...'); // DEBUG LOG
      
      // === PERBAIKAN: GUNAKAN PATH YANG BENAR ===
      const response = await fetch('/api/auth/login', { // ← UBAH DARI '/api/auth/login' ke '/api/login'
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Login response status:', response.status); // DEBUG LOG
      
      const data = await response.json();
      console.log('Login response data:', data); // DEBUG LOG

      if (response.ok) {
        console.log('Login successful, redirecting...'); // DEBUG LOG
        // Login berhasil, AuthContext akan handle redirect
        login(data.token, data.user);
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (err) {
      console.error('Login error:', err); // DEBUG LOG
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
          label="Username"
          name="username"
          type="text"
          required
          placeholder="Masukkan username"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
        />
        
        <Input
          label="Password"
          name="password"
          type="password"
          required
          placeholder="Masukkan password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          showPasswordToggle={true}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link 
            href="/lupa-password" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Lupa password?
          </Link>
        </div>
        <div className="text-sm">
          <Link 
            href="/registrasi" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Daftar akun baru
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Memproses...' : 'Login'}
      </Button>
    </form>
  );
}