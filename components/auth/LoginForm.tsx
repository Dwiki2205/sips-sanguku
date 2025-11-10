'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Username */}
      <Input
        label="Username"
        name="username"
        type="text"
        required
        placeholder="sangukuidn170945"
        value={formData.username}
        onChange={handleChange}
        disabled={loading}
        className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl h-12 text-base"
      />

      {/* Password */}
      <Input
        label="Password"
        name="password"
        type="password"
        required
        placeholder="sangukuidn170945"
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        showPasswordToggle={true}
        className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl h-12 text-base"
      />

      {/* Remember Me + Forgot */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="remember" className="ml-2 text-gray-700">
            Remember me
          </label>
        </div>
        <Link href="/lupa-password" className="text-blue-600 hover:text-blue-500 font-medium">
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full bg-white text-blue-600 hover:bg-gray-50 font-semibold rounded-xl h-12 shadow-md border border-gray-200"
      >
        Log In
      </Button>
    </form>
  );
}