'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import ModalPopup from '@/components/ui/ModalPopup';

type FormData = {
  membership_id?: string;
  pelanggan_id: string;
  tanggal_daftar: string;
  tier_membership: string;
  expired_date: string;
};

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

export default function EditMembershipPage() {
  const router = useRouter();
  const { id } = useParams();

  // State untuk modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'warning' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>({
    pelanggan_id: '',
    tanggal_daftar: '',
    tier_membership: 'Silver',
    expired_date: '',
  });

  useEffect(() => {
    if (id) {
      fetchMembershipData();
    }
  }, [id]);

  const fetchMembershipData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/membership/${id}`);
      
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      
      if (data.success && data.data) {
        const m = data.data;
        setForm({
          membership_id: m.membership_id,
          pelanggan_id: m.pelanggan_id || '',
          tanggal_daftar: formatDateForInput(m.tanggal_daftar),
          tier_membership: m.tier_membership || 'Silver',
          expired_date: formatDateForInput(m.expired_date),
        });
      } else {
        setModalType('warning');
        setModalTitle('Data membership tidak ditemukan');
        setModalOpen(true);
      }
    } catch (error) {
      setModalType('error');
      setModalTitle('Gagal memuat data membership');
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'tier_membership') {
      if (form.tanggal_daftar) {
        const date = new Date(form.tanggal_daftar);
        const newDate = new Date(date);
        switch (value) {
          case 'Silver': newDate.setMonth(newDate.getMonth() + 1); break;
          case 'Gold': newDate.setMonth(newDate.getMonth() + 6); break;
          case 'Platinum': newDate.setFullYear(newDate.getFullYear() + 1); break;
          default: newDate.setMonth(newDate.getMonth() + 1);
        }
        const newExpired = newDate.toISOString().split('T')[0];
        setForm(prev => ({ ...prev, [name]: value, expired_date: newExpired }));
      } else {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'tanggal_daftar') {
      if (value) {
        const date = new Date(value);
        const newDate = new Date(date);
        switch (form.tier_membership) {
          case 'Silver': newDate.setMonth(newDate.getMonth() + 1); break;
          case 'Gold': newDate.setMonth(newDate.getMonth() + 6); break;
          case 'Platinum': newDate.setFullYear(newDate.getFullYear() + 1); break;
          default: newDate.setMonth(newDate.getMonth() + 1);
        }
        const newExpired = newDate.toISOString().split('T')[0];
        setForm(prev => ({ ...prev, [name]: value, expired_date: newExpired }));
      } else {
        setForm(prev => ({ ...prev, [name]: value, expired_date: '' }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !form.membership_id) return;

    if (!form.pelanggan_id || !form.tanggal_daftar || !form.expired_date) {
      setModalType('warning');
      setModalTitle('Data Belum Diisi Lengkap');
      setModalOpen(true);
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        membership_id: form.membership_id,
        pelanggan_id: form.pelanggan_id,
        tanggal_daftar: form.tanggal_daftar,
        tier_membership: form.tier_membership,
        expired_date: form.expired_date,
      };

      const res = await fetch(`/api/membership/${form.membership_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setModalType('success');
        setModalTitle('Membership berhasil diperbarui!');
        setModalOpen(true);
      } else {
        setModalType('warning');
        setModalTitle(result.error || 'Gagal memperbarui membership');
        setModalOpen(true);
      }
    } catch (error: any) {
      setModalType('error');
      setModalTitle('Terjadi kesalahan: ' + error.message);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = () => {
    if (!form.expired_date) return 'Tidak diketahui';
    return new Date(form.expired_date) < new Date() ? 'Kadaluarsa' : 'Aktif';
  };

  const getTierDuration = (tier: string) => {
    switch (tier) {
      case 'Silver': return '1 Bulan';
      case 'Gold': return '6 Bulan';
      case 'Platinum': return '1 Tahun';
      default: return '1 Bulan';
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalType === 'success') {
      router.push('/owner/membership');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat data membership...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-blue-600 text-white rounded-2xl mx-6 mt-6">
        <div className="px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => router.push('/owner/membership')}
            className="p-2 hover:bg-blue-700 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Edit Membership #{form.membership_id}</h1>
        </div>
      </div>

      {/* FORM */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* KIRI */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Membership</label>
                <input
                  readOnly
                  value={form.membership_id || ''}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Pelanggan *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Daftar *</label>
                <input
                  required
                  type="date"
                  name="tanggal_daftar"
                  value={form.tanggal_daftar}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Tanggal mulai membership</p>
              </div>
            </div>

            {/* KANAN */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tier Membership *</label>
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
                <p className="text-xs text-gray-500 mt-1">Durasi: {getTierDuration(form.tier_membership)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Expired *</label>
                <input
                  required
                  type="date"
                  name="expired_date"
                  value={form.expired_date}
                  onChange={handleChange}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Dihitung otomatis</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Membership</label>
                <input
                  readOnly
                  value={getStatus()}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-100 font-medium border border-gray-300 ${
                    getStatus() === 'Aktif' ? 'text-green-600' : 'text-red-600'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {getStatus() === 'Aktif' ? 'Masih aktif' : 'Sudah kadaluarsa'}
                </p>
              </div>
            </div>
          </div>

          {/* RINGKASAN */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Ringkasan Perubahan:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-blue-600">Tier: </span><span className="font-medium">{form.tier_membership}</span></div>
              <div><span className="text-blue-600">Mulai: </span><span className="font-medium">{form.tanggal_daftar ? new Date(form.tanggal_daftar).toLocaleDateString('id-ID') : '-'}</span></div>
              <div><span className="text-blue-600">Expired: </span><span className="font-medium">{form.expired_date ? new Date(form.expired_date).toLocaleDateString('id-ID') : '-'}</span></div>
            </div>
          </div>

          {/* TOMBOL */}
          <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={() => router.push('/owner/membership')}
              disabled={loading}
              className="px-8"
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
                  Memperbarui...
                </>
              ) : (
                'Update Membership'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* MODAL POPUP */}
      <ModalPopup
        isOpen={modalOpen}
        type={modalType}
        title={modalTitle}
        onClose={handleModalClose}
      />
    </div>
  );
}