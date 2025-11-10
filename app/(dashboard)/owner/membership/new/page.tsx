'use client';

import { useState, useEffect } from 'react';
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

  // Hitung expired date otomatis ketika tier atau tanggal daftar berubah
  useEffect(() => {
    if (form.tanggal_daftar) {
      const date = new Date(form.tanggal_daftar);
      const newDate = new Date(date);
      
      // Hitung expired date berdasarkan tier
      switch (form.tier_membership) {
        case 'Silver':
          newDate.setMonth(newDate.getMonth() + 1); // 1 bulan
          break;
        case 'Gold':
          newDate.setMonth(newDate.getMonth() + 6); // 6 bulan
          break;
        case 'Platinum':
          newDate.setFullYear(newDate.getFullYear() + 1); // 1 tahun
          break;
        default:
          newDate.setMonth(newDate.getMonth() + 1); // default 1 bulan
      }
      
      const newExpiredDate = newDate.toISOString().split('T')[0];
      setForm(prev => ({
        ...prev,
        expired_date: newExpiredDate
      }));
    }
  }, [form.tanggal_daftar, form.tier_membership]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validasi data
    if (!form.pelanggan_id) {
      alert('ID Pelanggan harus diisi');
      return;
    }

    if (!form.tanggal_daftar) {
      alert('Tanggal daftar harus diisi');
      return;
    }

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

  // Fungsi untuk mendapatkan durasi berdasarkan tier
  const getTierDuration = (tier: string) => {
    switch (tier) {
      case 'Silver':
        return '1 Bulan';
      case 'Gold':
        return '6 Bulan';
      case 'Platinum':
        return '1 Tahun';
      default:
        return '1 Bulan';
    }
  };

  // Fungsi untuk mendapatkan status membership
  const getStatus = () => {
    if (!form.expired_date) return 'Tidak diketahui';
    
    const expired = new Date(form.expired_date);
    const today = new Date();
    
    if (expired < today) {
      return 'Kadaluarsa';
    } else {
      return 'Aktif';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER BIRU */}
      <div className="bg-blue-600 text-white rounded-2xl mx-6 mt-6">
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
            {/* KOLOM KIRI */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Membership
                </label>
                <input
                  readOnly
                  value={generatedId}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1">ID akan digenerate otomatis</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Pelanggan *
                </label>
                <input
                  required
                  name="pelanggan_id"
                  value={form.pelanggan_id}
                  onChange={handleChange}
                  placeholder="PLG001"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-1">Masukkan ID pelanggan yang valid</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Daftar *
                </label>
                <input
                  required
                  type="date"
                  name="tanggal_daftar"
                  value={form.tanggal_daftar}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tanggal mulai membership
                </p>
              </div>
            </div>

            {/* KOLOM KANAN */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier Membership *
                </label>
                <select
                  name="tier_membership"
                  value={form.tier_membership}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="Silver">Silver - 1 Bulan</option>
                  <option value="Gold">Gold - 6 Bulan</option>
                  <option value="Platinum">Platinum - 1 Tahun</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Durasi: {getTierDuration(form.tier_membership)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Expired *
                </label>
                <input
                  required
                  type="date"
                  name="expired_date"
                  value={form.expired_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Expired date dihitung otomatis berdasarkan tier dan tanggal daftar
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Membership
                </label>
                <input
                  readOnly
                  value={getStatus()}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-300 ${
                    getStatus() === 'Aktif' ? 'text-green-600' : 'text-red-600'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {getStatus() === 'Aktif' 
                    ? 'Membership akan aktif setelah dibuat' 
                    : 'Membership akan kadaluarsa setelah dibuat'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* INFO SUMMARY */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Ringkasan Membership:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Tier: </span>
                <span className="font-medium">{form.tier_membership}</span>
              </div>
              <div>
                <span className="text-blue-600">Tanggal Daftar: </span>
                <span className="font-medium">
                  {form.tanggal_daftar ? new Date(form.tanggal_daftar).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>
              <div>
                <span className="text-blue-600">Expired: </span>
                <span className="font-medium">
                  {form.expired_date ? new Date(form.expired_date).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              Membership akan berlaku selama {getTierDuration(form.tier_membership).toLowerCase()}
            </div>
          </div>

          {/* TOMBOL */}
          <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={() => router.push('/owner/membership')}
              className="px-8"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="px-8 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan Membership'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}