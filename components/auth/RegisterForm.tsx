// components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '', // TAMBAHKAN KEMBALI username
    email: '',
    telepon: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasi
    if (formData.password.length < 8) {
      setError('Password harus minimal 8 karakter');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      setLoading(false);
      return;
    }
    if (!formData.telepon.match(/^[0-9]{10,15}$/)) {
      setError('Nomor telepon harus 10-15 digit angka');
      setLoading(false);
      return;
    }
    if (formData.username.length < 3) {
      setError('Username harus minimal 3 karakter');
      setLoading(false);
      return;
    }

    try {
      // Tetap gunakan endpoint pelanggan
      const response = await fetch('/api/auth/registrasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Registrasi berhasil
        console.log('Registrasi berhasil, ID:', data.data.pelanggan_id);
        router.push('/');
      } else {
        setError(data.error || 'Registrasi gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50/90 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Input 
          label="Nama Lengkap" 
          name="nama_lengkap" 
          type="text" 
          required 
          placeholder="Masukkan nama lengkap" 
          value={formData.nama_lengkap} 
          onChange={handleChange} 
          disabled={loading} 
          className="bg-white/95 border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl h-12 text-base" 
        />
        
        {/* TAMBAHKAN USERNAME FIELD */}
        <Input 
          label="Username" 
          name="username" 
          type="text" 
          required 
          placeholder="Pilih username (minimal 3 karakter)" 
          value={formData.username} 
          onChange={handleChange} 
          disabled={loading} 
          className="bg-white/95 border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl h-12 text-base" 
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
          className="bg-white/95 border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl h-12 text-base" 
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
          className="bg-white/95 border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl h-12 text-base" 
        />
        
        <Input 
          label="Password" 
          name="password" 
          type="password" 
          required 
          placeholder="Minimal 8 karakter" 
          value={formData.password} 
          onChange={handleChange} 
          disabled={loading} 
          showPasswordToggle={true} 
          className="bg-white/95 border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl h-12 text-base" 
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
          className="bg-white/95 border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl h-12 text-base" 
        />
      </div>

      <div className="text-sm text-white/80">
        <p>
          Dengan mendaftar, Anda menyetujui{' '}
          <Link href="/syarat-ketentuan" className="text-blue-400 hover:text-blue-300">
            Syarat & Ketentuan
          </Link>{' '}
          dan{' '}
          <Link href="/kebijakan-privasi" className="text-blue-400 hover:text-blue-300">
            Kebijakan Privasi
          </Link>
        </p>
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-xl h-12 shadow-md border border-gray-200"
      >
        {loading ? 'Mendaftarkan...' : 'Daftar sebagai Pelanggan'}
      </Button>

    </form>
  );
}