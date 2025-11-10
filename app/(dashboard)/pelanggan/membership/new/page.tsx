'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ArrowLeft } from 'lucide-react';

export default function PelangganMembershipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [form, setForm] = useState({
    tanggal_daftar: new Date().toISOString().split('T')[0],
    tier_membership: 'Silver',
    expired_date: '',
  });

  const [modal, setModal] = useState<{
    open: boolean;
    type: 'success' | 'warning';
    title: string;
    message: string;
  }>({ open: false, type: 'success', title: '', message: '' });

  const generatedId = `MEM${String(Date.now()).slice(-6)}`;

  const durations = [
    { label: '1 Bulan', months: 1 },
    { label: '3 Bulan', months: 3 },
    { label: '6 Bulan', months: 6 },
    { label: '9 Bulan', months: 9 },
    { label: '1 Tahun', months: 12 },
  ];

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.role_name === 'pelanggan') {
          setUser(data);
        } else {
          alert('Akses ditolak');
          router.push('/');
        }
      })
      .catch(() => {
        alert('Silakan login terlebih dahulu');
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setExpiredDate = (months: number) => {
    const start = new Date(form.tanggal_daftar);
    const exp = new Date(start);
    exp.setMonth(exp.getMonth() + months);
    setForm({ ...form, expired_date: exp.toISOString().split('T')[0] });
  };

  const checkExisting = async (): Promise<boolean> => {
    const res = await fetch(`/api/membership?pelanggan_id=${user.pengguna_id}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const active = data.find((m: any) => 
        m.status_keaktifan === 'active' || new Date(m.expired_date) >= new Date()
      );
      if (active) {
        setModal({
          open: true,
          type: 'warning',
          title: 'Membership sudah terdaftar',
          message: 'Anda sudah memiliki membership aktif.',
        });
        return true;
      }
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.expired_date) {
      setModal({
        open: true,
        type: 'warning',
        title: 'Data belum lengkap',
        message: 'Harap pilih durasi membership terlebih dahulu.',
      });
      return;
    }

    setLoading(true);
    const already = await checkExisting();
    if (already) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membership_id: generatedId,
          pelanggan_id: user.pengguna_id,
          ...form,
        }),
      });

      if (res.ok) {
        setModal({
          open: true,
          type: 'success',
          title: 'Berhasil!',
          message: 'Anda telah terdaftar sebagai membership',
        });
      } else {
        const err = await res.json();
        if (err.error === 'already_active') {
          setModal({
            open: true,
            type: 'warning',
            title: 'Membership sudah terdaftar',
            message: err.message || 'Anda sudah punya membership aktif.',
          });
        } else {
          setModal({
            open: true,
            type: 'warning',
            title: 'Gagal',
            message: err.error || 'Terjadi kesalahan.',
          });
        }
      }
    } catch (err: any) {
      setModal({
        open: true,
        type: 'warning',
        title: 'Error',
        message: 'Koneksi gagal. Coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* HEADER & FORM (sama seperti sebelumnya) */}
      <div className="bg-blue-600 text-white rounded-2xl">
        <div className="px-6 py-5 flex items-center gap-4">
          <button onClick={() => router.push('/pelanggan/dashboard')} className="p-2 hover:bg-blue-700 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Tambah Membership Baru</h1>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* ... FORM GRID SAMA ... */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* KIRI */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Membership</label>
                <input readOnly value={generatedId} className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Pelanggan</label>
                <input readOnly value={user.pengguna_id} className="w-full px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-bold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Daftar</label>
                <input required type="date" name="tanggal_daftar" value={form.tanggal_daftar} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
              </div>
            </div>

            {/* KANAN */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tier Membership</label>
                <select name="tier_membership" value={form.tier_membership} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Expired</label>
                <input required type="date" name="expired_date" value={form.expired_date} onChange={handleChange} min={form.tanggal_daftar}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                <div className="mt-3 flex flex-wrap gap-2">
                  {durations.map(d => (
                    <button key={d.label} type="button" onClick={() => setExpiredDate(d.months)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition shadow-md">
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <input readOnly
                  value={form.expired_date ? (new Date(form.expired_date) < new Date() ? 'Kadaluarsa' : 'Aktif') : 'Pilih durasi'}
                  className={`w-full px-4 py-3 rounded-lg font-medium ${
                    form.expired_date
                      ? new Date(form.expired_date) < new Date()
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`} />
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border-2 border-amber-200">
                <p className="font-bold text-amber-800">Manfaat {form.tier_membership}:</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {form.tier_membership === 'Silver' && (
                    <> <li>✓ Diskon 5% booking</li> <li>✓ Prioritas jam sepi</li> </>
                  )}
                  {form.tier_membership === 'Gold' && (
                    <> <li>✓ Diskon 15% + 1x gratis/bulan</li> <li>✓ Akses VIP lounge</li> </>
                  )}
                  {form.tier_membership === 'Platinum' && (
                    <> <li>✓ Diskon 30% + 3x gratis/bulan</li> <li>✓ Personal trainer</li> <li>✓ Event eksklusif</li> </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-10">
            <Button type="button" variant="danger" size="lg" onClick={() => router.push('/pelanggan/dashboard')} className="px-8">
              Batal
            </Button>
            <Button type="submit" variant="primary" size="lg" loading={loading} className="px-8 bg-green-500 hover:bg-green-600">
              Simpan Membership
            </Button>
          </div>
        </form>
      </div>

      {/* MODAL BARU */}
      <Modal
        isOpen={modal.open}
        type={modal.type}
        title={modal.title}
        onClose={() => {
          setModal({ ...modal, open: false });
          if (modal.type === 'success') {
            router.push('/pelanggan/dashboard');
          }
        }}
      >
        {modal.message}
      </Modal>
    </>
  );
}