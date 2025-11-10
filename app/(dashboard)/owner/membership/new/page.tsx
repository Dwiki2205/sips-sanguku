'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

type FormData = {
  pelanggan_id: string;
  tanggal_daftar: string;
  tier_membership: string;
  expired_date: string;
};

export default function NewMembershipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    pelanggan_id: '',
    tanggal_daftar: new Date().toISOString().split('T')[0],
    tier_membership: 'Silver',
    expired_date: '',
  });

  const generatedId = `MEM${String(Date.now()).slice(-6)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membership_id: generatedId,
          ...form,
        }),
      });

      if (res.ok) {
        alert('Membership berhasil dibuat!');
        router.push('/owner/membership');
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal membuat membership');
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HEADER BIRU */}
      <div className="bg-blue-600 text-white rounded-2xl">
        <div className="px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => router.push('/owner/membership')}
            className="p-2 hover:bg-blue-700 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Tambah Membership Baru</h1>
        </div>
      </div>

      {/* FORM */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* KIRI */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Membership
                </label>
                <input
                  readOnly
                  value={generatedId}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Pelanggan
                </label>
                <input
                  required
                  name="pelanggan_id"
                  value={form.pelanggan_id}
                  onChange={handleChange}
                  placeholder="PLG001"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Daftar
                </label>
                <input
                  required
                  type="date"
                  name="tanggal_daftar"
                  value={form.tanggal_daftar}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>

            {/* KANAN */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier Membership
                </label>
                <select
                  name="tier_membership"
                  value={form.tier_membership}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Expired
                </label>
                <input
                  required
                  type="date"
                  name="expired_date"
                  value={form.expired_date}
                  onChange={handleChange}
                  min={form.tanggal_daftar}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Otomatis
                </label>
                <input
                  readOnly
                  value={new Date(form.expired_date) < new Date() ? 'Kadaluarsa' : 'Aktif'}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* TOMBOL */}
          <div className="flex justify-end gap-4 mt-10">
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={() => router.push('/owner/membership')}
              className="px-8"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="px-8 bg-green-500 hover:bg-green-600"
            >
              Simpan Membership
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}